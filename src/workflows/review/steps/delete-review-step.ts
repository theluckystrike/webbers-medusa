import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type ReviewService from '../../../modules/review/service';
import { REVIEW_MODULE } from '../../../modules/review';

import ReviewProductLink from '../../../links/product-review-product';

export const deleteReviewStep = createStep(
  'delete-review-step',
  async (input: { id: string }, { container }) => {
    const query = container.resolve('query');
    const reviewService = container.resolve<ReviewService>(REVIEW_MODULE);

    const { data: reviewProducts } = await query.graph({
      entity: ReviewProductLink.entryPoint,
      fields: ['review_id', 'product_id'],
      filters: {
        review_id: input.id,
      },
    });

    await reviewService.softDeleteReviews([input.id]);

    const productIds: string[] = reviewProducts.map(rp => rp.product_id);

    return new StepResponse(productIds, input.id);
  },
  async (id, { container }) => {
    if (!id) return;
    const reviewService = container.resolve<ReviewService>(REVIEW_MODULE);
    await reviewService.restoreReviews([id]);
  }
);
