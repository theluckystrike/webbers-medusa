import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import { MedusaRequest } from '@medusajs/framework/http';
import { PostAdminStoreReview } from './[id]/validators';
import { createReviewsWorkflow } from '../../../workflows/review/create-reviews';
import { z } from '@medusajs/framework/zod';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import ReviewProductLink from '../../../links/product-review-product';

type PostAdminStoreReviewType = z.infer<typeof PostAdminStoreReview>;

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const hasProductFilter = !!req.filterableFields.product_id;

  let reviewIdFilter: string[] | undefined;

  if (hasProductFilter) {
    const { data: links } = await query.graph({
      entity: ReviewProductLink.entryPoint,
      fields: ['review_id'],
      filters: {
        product_id: (req.filterableFields.product_id as string)?.split(','),
      },
    });

    delete (req.filterableFields as any).product_id;

    if (!links.length) {
      return res.status(200).json({
        reviews: [],
        count: 0,
        offset: 0,
        limit: req.queryConfig?.pagination?.take ?? 0,
      });
    }

    reviewIdFilter = links.map(l => l.review_id);
  }

  const { data: reviews, metadata = { count: 0, skip: 0, take: 0 } } = await query.graph({
    entity: 'review',
    filters: {
      ...req.filterableFields,
      ...(reviewIdFilter ? { id: reviewIdFilter } : {}),
    },
    ...req.queryConfig,
  });

  res.status(200).json({
    reviews,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
};

export const POST = async (req: MedusaRequest<PostAdminStoreReviewType>, res: MedusaResponse) => {
  const newReview = req.validatedBody;

  const { result } = await createReviewsWorkflow(req.scope).run({
    input: {
      reviews: [newReview],
    },
  });

  res.json({ reviews: result });
};
