import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { REVIEW_MODULE } from '../../../modules/review';
import type ReviewResponseService from '../../../modules/review/service';
import type { UpdateReviewResponseInput } from '../../../modules/review/types/mutations';
import type { ReviewResponse } from '../../../modules/review/types/common';

export const updateProductReviewResponseStepId = 'update-product-review-response-step';

export const updateReviewResponseStep = createStep(
  updateProductReviewResponseStepId,
  async (data: UpdateReviewResponseInput[], { container }) => {
    const productReviewResponseService = container.resolve<ReviewResponseService>(REVIEW_MODULE);

    const existingResponses = await productReviewResponseService.listReviewResponses({
      id: data.map(d => d.id),
    });

    const updatedResponses: ReviewResponse[] = await productReviewResponseService.updateReviewResponses(data);

    return new StepResponse(updatedResponses, existingResponses);
  }
);
