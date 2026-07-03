import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';
import { PostEditEmail } from './validators';
import { Modules } from '@medusajs/framework/utils';
import { WEBBERS_SETTINGS_MODULE } from '../../../../../modules/webbers-settings';
import WebbersSettingsService from '../../../../../modules/webbers-settings/service';
import { buildEmailSyncStatements } from '../../../../../options';

// Resolved from the host app's container (the host app registers a `custom_query` module
// exposing PSQLQuery / PSQLTransaction — see this plugin's README). Not bundled here so the
// app keeps a single shared instance.
const CUSTOM_QUERY = 'custom_query';

type CustomQueryService = {
  PSQLQuery<T = any>(query: string, params?: any[]): Promise<T[]>;
  PSQLTransaction<T = any>(
    callback: (tx: { execute: (query: string, params?: any[]) => Promise<any> }) => Promise<T>
  ): Promise<T>;
};

type PostEditEmailType = z.infer<typeof PostEditEmail>;

export const POST = async (req: MedusaRequest<PostEditEmailType>, res: MedusaResponse) => {
  const { email: newEmail } = req.body;
  const { id } = req.params;
  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const customQueryModuleService: CustomQueryService = req.scope.resolve(CUSTOM_QUERY);
  const settings: WebbersSettingsService = req.scope.resolve(WEBBERS_SETTINGS_MODULE);

  const customer = await customerModule.retrieveCustomer(id);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  if (!customer.has_account) {
    return res.status(404).json({ error: 'Customer does not have an account' });
  }

  // Extra host-owned tables (e.g. subscriptions) whose email should follow the customer email
  // are declared in plugin options, keeping this plugin decoupled from those modules.
  const { emailSyncTables } = settings.getEditEmailConfig();

  await customQueryModuleService.PSQLTransaction(async transactionManager => {
    await transactionManager.execute(
      `
        WITH updated_customer AS (
          UPDATE customer
            SET email = ?
            WHERE id = ?
            RETURNING id
        ),
             updated_provider_identity AS (
               UPDATE provider_identity pi
                 SET entity_id = ?
                 FROM auth_identity ai, updated_customer uc
                 WHERE pi.auth_identity_id = ai.id
                   AND (ai.app_metadata->>'customer_id')::text = uc.id
             )
        SELECT 1;
      `,
      [
        newEmail, // customer.email
        id, // customer.id
        newEmail, // provider_identity.entity_id (new)
      ]
    );

    // Host-configured extra tables (e.g. `subscription`) — same transaction, atomic.
    for (const stmt of buildEmailSyncStatements(emailSyncTables, id, newEmail)) {
      await transactionManager.execute(stmt.sql, stmt.params as any[]);
    }
  });

  // Remove klaviyo id so it can reset itself
  if (customer.metadata?.klaviyo_id) {
    await customerModule.updateCustomers(customer.id, {
      metadata: {
        ...customer.metadata,
        klaviyo_id: undefined,
      },
    });
  }

  return res.status(200).json({ success: true });
};
