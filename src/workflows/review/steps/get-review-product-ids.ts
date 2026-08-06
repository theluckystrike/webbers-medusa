import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import ReviewProductLink from '../../../links/product-review-product';

export const getReviewProductIdsStepId = 'get-review-product-ids';

export const getReviewProductIdsStep = createStep(
  getReviewProductIdsStepId,
  async (reviewIds: string[], { container }) => {
    if (!reviewIds.length) {
      return new StepResponse<string[]>([]);
    }

    const query = container.resolve('query');

    const { data: reviewProducts } = await query.graph({
      entity: ReviewProductLink.entryPoint,
      fields: ['product_id'],
      filters: {
        review_id: reviewIds,
      },
    });

    const productIds: string[] = reviewProducts.map(rp => rp.product_id);

    return new StepResponse(productIds);
  }
);
