import { z } from "@medusajs/framework/zod";

export const PostEditEmail = z.object({
  email: z.string(),
});
