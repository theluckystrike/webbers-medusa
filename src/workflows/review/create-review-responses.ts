import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { CreateReviewResponseWorkflowInput } from '../../modules/review/types/mutations';
import { createReviewResponsesStep } from './steps/create-review-responses';

export const createReviewResponsesWorkflow = createWorkflow(
  'create-review-responses-workflow',
  (input: WorkflowData<CreateReviewResponseWorkflowInput>) => {
    const reviewResponses = createReviewResponsesStep(input.responses);

    const emitData = transform({ reviewResponses }, ({ reviewResponses }) => {
      return {
        eventName: 'review_response.created',
        data: reviewResponses.map(response => ({
          id: response.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(reviewResponses);
  }
);
