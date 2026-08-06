import { type MiddlewareRoute, validateAndTransformBody, validateAndTransformQuery } from '@medusajs/framework';
import { createFindParams, createOperatorMap } from '@medusajs/medusa/api/utils/validators';
import { z } from '@medusajs/framework/zod';
import { Review } from '../../../modules/review/types';
import { QueryConfig } from '@medusajs/types';

const reviewStatuses = z.enum(['pending', 'approved', 'flagged']);

export const listStoreProductReviewsQuerySchema = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  // @ts-ignore
  z.object({
    id: z.union([z.string(), z.array(z.string())]).optional(),
    status: z
      .union([reviewStatuses, z.array(reviewStatuses)])
      .default('approved')
      .optional(),
    type: z.enum(['product']).optional(),
    product_id: z.union([z.string(), z.array(z.string())]).optional(),
    order_id: z.union([z.string(), z.array(z.string())]).optional(),
    rating: z.union([z.number().max(5).min(1), z.array(z.number().max(5).min(1))]).optional(),
    created_at: createOperatorMap().optional(),
    updated_at: createOperatorMap().optional(),
  })
);

export const insertProductReviewsSchema = z.object({
  reviews: z.array(
    z.object({
      product_id: z.string(),
      rating: z.number().max(5).min(1),
      content: z.string(),
      title: z.string(),
      city: z.string().optional(),
      gender: z.string().optional(),
      age: z.string().optional(),
      name: z.string(),
      recommend: z.boolean(),
      images: z.array(z.object({ url: z.string() })),
      type: z.enum(['product']).optional(),
    })
  ),
});

export type InsertProductReviewsSchema = z.infer<typeof insertProductReviewsSchema>;

export const defaultStoreProductReviewFields = [
  'id',
  'status',
  'product_id',
  'name',
  'rating',
  'content',
  'title',
  'city',
  'gender',
  'age',
  'type',
  'recommend',
  'created_at',
  'updated_at',
  'response.*',
  'images.*',
];

export const allowedStoreProductReviewFields = [
  'id',
  'status',
  'product_id',
  'name',
  'rating',
  'content',
  'title',
  'city',
  'gender',
  'age',
  'type',
  'recommend',
  'created_at',
  'updated_at',
  'response',
  'images',
  'product.*',
];

export const defaultStoreReviewsQueryConfig: QueryConfig<Review> = {
  allowed: [...allowedStoreProductReviewFields],
  defaults: [...defaultStoreProductReviewFields],
  defaultLimit: 50,
  isList: true,
};

export const storeProductReviewRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/store/product-reviews',
    method: 'GET',
    middlewares: [validateAndTransformQuery(listStoreProductReviewsQuerySchema, defaultStoreReviewsQueryConfig)],
  },
  {
    matcher: '/store/product-reviews',
    method: 'POST',
    // @ts-ignore
    middlewares: [validateAndTransformBody(insertProductReviewsSchema)],
  },
];
