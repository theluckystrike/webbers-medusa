import {
  type MiddlewareRoute,
  MiddlewareVerb,
  validateAndTransformBody,
  validateAndTransformQuery,
} from '@medusajs/framework';
import { createFindParams, createOperatorMap } from '@medusajs/medusa/api/utils/validators';
import { z } from '@medusajs/framework/zod';
import { PostAdminStoreReview, PostAdminUpdateReview } from './[id]/validators';

const statuses = z.enum(['pending', 'approved', 'flagged'] as const);
export const listAdminReviewsQuerySchema = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  // @ts-ignore
  z.object({
    q: z.string().optional(),
    id: z.union([z.string(), z.array(z.string())]).optional(),
    status: z.union([statuses, z.array(statuses)]).optional(),
    product_id: z.union([z.string(), z.array(z.string())]).optional(),
    order_id: z.union([z.string(), z.array(z.string())]).optional(),
    rating: z.union([z.coerce.number().max(5).min(1), z.array(z.coerce.number().max(5).min(1))]).optional(),
    created_at: createOperatorMap().optional(),
    updated_at: createOperatorMap().optional(),
  })
);

export const defaultAdminReviewFields = [
  'id',
  'status',
  'product_id',
  'rating',
  'name',
  'email',
  'content',
  'order_id',
  'created_at',
  'updated_at',
  'response.*',
  'images.*',
  'has_images',
  'title',
  'products.*',
  'recommend',
  'type',
  'gender',
  'age',
  'city',
];

export const defaultReviewsQueryConfig = {
  defaults: [...defaultAdminReviewFields],
  defaultLimit: 50,
  isList: true,
};

export const adminReviewRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/reviews',
    method: ['GET'] as MiddlewareVerb[],
    middlewares: [validateAndTransformQuery(listAdminReviewsQuerySchema, defaultReviewsQueryConfig)],
  },
  {
    matcher: '/admin/reviews/:id',
    method: ['PATCH'] as MiddlewareVerb[],
    middlewares: [validateAndTransformBody(PostAdminUpdateReview)],
  },
  {
    matcher: '/admin/reviews',
    method: ['POST'] as MiddlewareVerb[],
    middlewares: [validateAndTransformBody(PostAdminStoreReview)],
  },
  {
    matcher: '/admin/reviews/:id',
    method: ['DELETE'] as MiddlewareVerb[],
  },
];
