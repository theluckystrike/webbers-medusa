import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { REVIEW_MODULE } from '../../../modules/review';
import type ReviewService from '../../../modules/review/service';
import type { CreateReviewInput } from '../../../modules/review/types/mutations';

export const createReviewsStepId = 'create-review-step';

export const createReviewsStep = createStep(
  createReviewsStepId,
  async (data: CreateReviewInput[], { container }) => {
    const reviewService = container.resolve<ReviewService>(REVIEW_MODULE);

    const createData: any[] = data.map(d => ({
      ...d,
      status: reviewService.defaultReviewStatus,
      has_images: !!d?.images?.length,
      images:
        d?.images?.map(image => ({
          url: image.url,
        })) ?? [],
    }));

    const reviews = await reviewService.createReviews(createData);

    return new StepResponse(reviews, {
      reviewIds: reviews.map(review => review.id),
    });
  },
  async (data, { container }) => {
    if (!data) return;

    const { reviewIds } = data;

    const reviewService = container.resolve<ReviewService>(REVIEW_MODULE);

    await reviewService.deleteReviews(reviewIds);

    // await productReviewService.refreshProductReviewStats(productReviewIds);
  }
);
