import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { REVIEW_MODULE } from '../../../modules/review';
import type ReviewResponseService from '../../../modules/review/service';
import type { CreateReviewResponseInput } from '../../../modules/review/types/mutations';
import type { ReviewResponse } from '../../../modules/review/types/common';

export const createReviewResponsesStepId = 'create-review-response-step';

export const createReviewResponsesStep = createStep<CreateReviewResponseInput[], ReviewResponse[], string[]>(
  createReviewResponsesStepId,
  async (data, { container }) => {
    const reviewResponseService = container.resolve<ReviewResponseService>(REVIEW_MODULE);

    const createdResponses = (await reviewResponseService.createReviewResponses(data)) as ReviewResponse[];

    return new StepResponse(
      createdResponses,
      createdResponses.map(cr => cr.id)
    );
  },
  async (data, { container }) => {
    if (!data) return;

    const reviewResponseService = container.resolve<ReviewResponseService>(REVIEW_MODULE);

    await reviewResponseService.deleteReviewResponses(data);

    return new StepResponse({ success: true });
  }
);
