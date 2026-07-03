import { z } from '@medusajs/framework/zod';

export const PatchAdminUpdatePriceListExt = z.object({
  id: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
});
