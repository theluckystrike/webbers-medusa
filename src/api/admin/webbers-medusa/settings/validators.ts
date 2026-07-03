import { z } from '@medusajs/framework/zod';

export const PostWebbersSettings = z.object({
  flags: z.record(z.string(), z.boolean()),
});
