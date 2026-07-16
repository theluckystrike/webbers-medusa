import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { CUSTOM_QUERY } from '../../../../../modules/custom-query';
import CustomQueryService from '../../../../../modules/custom-query/service';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const customQueryService: CustomQueryService = req.scope.resolve(CUSTOM_QUERY);

  const notifications = await customQueryService.PSQLQuery<
    { template: string; recipients: string[]; sent_at: string }[]
  >(
    `SELECT
       template,
       ARRAY_AGG("to" ORDER BY created_at) AS recipients,
       DATE_TRUNC('minute', MIN(created_at)) AS sent_at
     FROM notification
     WHERE data->'order'->>'id' = ?
       AND deleted_at IS NULL
     GROUP BY template, DATE_TRUNC('minute', created_at)
     ORDER BY sent_at DESC`,
    [id]
  );

  res.json({ notifications: notifications ?? [] });
};
