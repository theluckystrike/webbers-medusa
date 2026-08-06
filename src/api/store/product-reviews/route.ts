import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { defaultStoreProductReviewFields, InsertProductReviewsSchema } from './middlewares';
import { createReviewsWorkflow } from '../../../workflows/review/create-reviews';
import ReviewProductLink from '../../../links/product-review-product';

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: links } = await query.graph({
    entity: ReviewProductLink.entryPoint,
    fields: ['review.id'],
    filters: {
      product_id: req.filterableFields.product_id,
    },
  });

  delete req.filterableFields.product_id;

  const { data: product_reviews, metadata } = await query.graph({
    entity: 'review',
    filters: {
      ...req.filterableFields,
      id: [...links.map(l => l.review_id)],
    },
    ...req.queryConfig,
  });

  res
    .status(200)
    .json({ product_reviews, count: metadata?.count ?? 0, offset: metadata?.skip ?? 0, limit: metadata?.take ?? 0 });
};

export const POST = async (req: AuthenticatedMedusaRequest<InsertProductReviewsSchema>, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { reviews } = req.validatedBody;

  reviews.forEach((review: any) => {
    review.type = 'product';
    review.products = [review.product_id];
  });

  const { result } = await createReviewsWorkflow(req.scope).run({ input: { reviews: reviews } });

  const createdReviewIds = result.map(review => review.id);

  const { data: product_reviews } = await query.graph({
    entity: 'review',
    fields: [...defaultStoreProductReviewFields],
    filters: {
      id: [...createdReviewIds],
    },
  });

  res.status(200).json({ product_reviews });
};
