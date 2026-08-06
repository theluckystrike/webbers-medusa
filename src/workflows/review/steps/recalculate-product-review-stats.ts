import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import ProductReviewService from '../../../modules/review/service';
import { REVIEW_MODULE } from '../../../modules/review';

export const recalculateProductReviewStatsStepId = 'recalculate-product-review-stats';

export const recalculateProductReviewStatsStep = createStep(
  recalculateProductReviewStatsStepId,
  async (productIds: string[], { container }) => {
    const productReviewService = container.resolve<ProductReviewService>(REVIEW_MODULE);

    const stats = await productReviewService.listProductReviewStats({
      product_id: productIds,
    });

    await productReviewService.refreshProductReviewStats(productIds);

    return new StepResponse(
      stats,
      stats.map(stat => stat.id)
    );
  }
);
