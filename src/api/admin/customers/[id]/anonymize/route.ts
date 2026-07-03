import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';
import { WEBBERS_SETTINGS_MODULE } from '../../../../../modules/webbers-settings';
import WebbersSettingsService from '../../../../../modules/webbers-settings/service';
import {
  buildAddressAnonymizeStatements,
  buildAnonEmail,
  buildCustomerScopedAnonymizeStatements,
} from '../../../../../options';

// Resolved from the host app's container. The host app must register a module under this key
// exposing PSQLQuery / PSQLTransaction (see this plugin's README). It is intentionally not
// bundled here so the app keeps a single shared instance.
const CUSTOM_QUERY = 'custom_query';

type CustomQueryService = {
  PSQLQuery<T = any>(query: string, params?: any[]): Promise<T[]>;
  PSQLTransaction<T = any>(
    callback: (tx: { execute: (query: string, params?: any[]) => Promise<any> }) => Promise<T>
  ): Promise<T>;
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const customQueryService: CustomQueryService = req.scope.resolve(CUSTOM_QUERY);
  const settings: WebbersSettingsService = req.scope.resolve(WEBBERS_SETTINGS_MODULE);

  const customer = await customerModule.retrieveCustomer(id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  // Extra host-owned tables (e.g. subscriptions) are declared in plugin options so this plugin
  // stays free of any dependency on those modules.
  const anonymizeConfig = settings.getAnonymizeConfig();
  const anonEmail = buildAnonEmail(anonymizeConfig.emailDomain, Date.now());

  await customQueryService.PSQLTransaction(async (tx) => {
    await tx.execute(
      `UPDATE customer_address
       SET first_name = NULL, last_name = NULL, company = NULL, phone = NULL,
           address_1 = NULL, address_2 = NULL, city = NULL, country_code = NULL,
           postal_code = NULL, metadata = NULL
       WHERE customer_id = ?`,
      [id]
    );

    await tx.execute(`UPDATE cart SET email = ? WHERE customer_id = ?`, [anonEmail, id]);

    await tx.execute(
      `UPDATE cart_address
       SET first_name = NULL, last_name = NULL, company = NULL, phone = NULL,
           address_1 = NULL, address_2 = NULL, city = NULL, country_code = NULL,
           postal_code = NULL, metadata = NULL
       WHERE id IN (
           SELECT billing_address_id FROM cart WHERE customer_id = ? AND billing_address_id IS NOT NULL
           UNION
           SELECT shipping_address_id FROM cart WHERE customer_id = ? AND shipping_address_id IS NOT NULL
       )`,
      [id, id]
    );

    await tx.execute(`UPDATE "order" SET email = ? WHERE customer_id = ?`, [anonEmail, id]);

    await tx.execute(
      `UPDATE order_address
       SET first_name = NULL, last_name = NULL, company = NULL, phone = NULL,
           address_1 = NULL, address_2 = NULL, city = NULL, country_code = NULL,
           postal_code = NULL, metadata = NULL
       WHERE id IN (
           SELECT billing_address_id FROM "order" WHERE customer_id = ? AND billing_address_id IS NOT NULL
           UNION
           SELECT shipping_address_id FROM "order" WHERE customer_id = ? AND shipping_address_id IS NOT NULL
       )`,
      [id, id]
    );

    // Host-configured extra customer-scoped tables (e.g. `subscription`).
    for (const stmt of buildCustomerScopedAnonymizeStatements(
      anonymizeConfig.customerScopedTables,
      id,
      anonEmail
    )) {
      await tx.execute(stmt.sql, stmt.params as any[]);
    }

    // Host-configured extra address tables (e.g. `subscription_address`).
    for (const stmt of buildAddressAnonymizeStatements(anonymizeConfig.addressTables, id)) {
      await tx.execute(stmt.sql, stmt.params as any[]);
    }

    await tx.execute(
      `UPDATE customer
       SET email = ?, first_name = NULL, last_name = NULL, phone = NULL, metadata = NULL
       WHERE id = ?`,
      [anonEmail, id]
    );
  });

  return res.status(200).json({ success: true });
};
