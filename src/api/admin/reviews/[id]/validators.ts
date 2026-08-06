import { z } from '@medusajs/framework/zod';

export const PostAdminStoreReview = z.object({
  rating: z.number(),
  content: z.string().optional(),
  title: z.string(),
  email: z.string().optional(),
  recommend: z.boolean(),
  type: z.enum(['product', 'store']),
  gender: z.string().optional(),
  age: z.string().optional(),
  city: z.string().optional(),
  name: z.string().optional(),
});

export const PostAdminUpdateReview = z.object({
  add_product_ids: z.array(z.string()).optional(),
  remove_product_ids: z.array(z.string()).optional(),
  rating: z.number().optional(),
  content: z.string().optional(),
  title: z.string().optional(),
  email: z.string().optional(),
  recommend: z.boolean().optional(),
  type: z.enum(['product', 'store']).optional(),
  gender: z.string().optional(),
  age: z.string().optional(),
  city: z.string().optional(),
  name: z.string().optional(),
});
