import { z } from "@medusajs/framework/zod";

export const PostAdminEditNote = z.object({
  note: z.string(),
  note_id: z.string().optional(),
  type: z.string(),
  type_id: z.string(),
});
