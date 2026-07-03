import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';

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

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const customQueryService: CustomQueryService = req.scope.resolve(CUSTOM_QUERY);

  const customer = await customerModule.retrieveCustomer(id);

  if (!customer || !customer.has_account) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const result = await customQueryService.PSQLQuery<{ count: number }>(
    'SELECT COUNT(*)::integer AS count FROM "order" WHERE email = ? AND customer_id != ?',
    [customer.email, id]
  );

  return res.json({ count: Number(result[0]?.count ?? 0), email: customer.email });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const customQueryService: CustomQueryService = req.scope.resolve(CUSTOM_QUERY);

  const customer = await customerModule.retrieveCustomer(id);

  if (!customer || !customer.has_account) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const result = await customQueryService.PSQLQuery<{ id: string }>(
    'UPDATE "order" SET customer_id = ? WHERE email = ? AND customer_id != ? RETURNING id',
    [id, customer.email, id]
  );

  return res.json({ transferred_count: result.length });
};
