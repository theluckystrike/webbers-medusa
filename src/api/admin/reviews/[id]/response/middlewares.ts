import { z } from '@medusajs/framework/zod';
import { MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';

export const createReviewResponseDTO = z.object({
  content: z.string().min(1),
});

export type CreateReviewResponseDTO = z.infer<typeof createReviewResponseDTO>;

export const adminReviewResponseRouteMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/reviews/:id/response',
    method: 'POST',
    // @ts-ignore
    middlewares: [validateAndTransformBody(createReviewResponseDTO)],
  },
  {
    matcher: '/admin/reviews/:id/response',
    method: 'PUT',
    // @ts-ignore
    middlewares: [validateAndTransformBody(createReviewResponseDTO)],
  },
  {
    matcher: '/admin/reviews/:id/response',
    method: 'DELETE',
    middlewares: [],
  },
];
