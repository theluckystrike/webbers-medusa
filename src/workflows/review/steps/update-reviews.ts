import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { REVIEW_MODULE } from '../../../modules/review';
import type ProductReviewService from '../../../modules/review/service';
import type { UpdateReviewInput } from '../../../modules/review/types';

export const updateReviewsStepId = 'update-product-reviews-step';

export const updateReviewsStep = createStep(
  updateReviewsStepId,
  async (data: UpdateReviewInput[], { container }) => {
    const reviewService = container.resolve<ProductReviewService>(REVIEW_MODULE);

    if ('add_product_ids' in data || 'remove_product_ids' in data) {
      return new StepResponse([]);
    }

    const existingReviews = await reviewService.listReviews(
      { id: data.map(d => d.id) },
      {
        relations: ['images'],
      }
    );

    const updatedReviews = await reviewService.updateReviews(data as any[]);

    return new StepResponse(updatedReviews, existingReviews);
  },
  async (data, { container }) => {
    if (!data || !Array.isArray(data)) return;

    const reviewService = container.resolve<ProductReviewService>(REVIEW_MODULE);

    await reviewService.updateReviews(data as any[]);
  }
);
