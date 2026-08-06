import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { REVIEW_MODULE } from '../../../modules/review';
import type ReviewResponseService from '../../../modules/review/service';
import { ReviewResponse } from '../../../modules/review/types/common';

export const deleteReviewResponseStepId = 'delete-review-response-step';

export const deleteReviewResponseStep = createStep<string[], { success: boolean }, ReviewResponse[]>(
  deleteReviewResponseStepId,
  async (ids, { container }) => {
    const reviewResponseService = container.resolve<ReviewResponseService>(REVIEW_MODULE);

    const responses = (await reviewResponseService.listReviewResponses({
      id: ids,
    })) as ReviewResponse[];

    await reviewResponseService.deleteReviewResponses(ids);

    return new StepResponse({ success: true }, responses);
  },
  async (data, { container }) => {
    const reviewResponseService = container.resolve<ReviewResponseService>(REVIEW_MODULE);

    if (!data) return;

    await reviewResponseService.createReviewResponses(data as any[]);
  }
);
