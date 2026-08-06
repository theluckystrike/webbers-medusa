import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { UpdateReviewResponsesWorkflowInput } from '../../modules/review/types/mutations';
import { updateReviewResponseStep } from './steps/update-review-response';

export const updateReviewResponsesWorkflow = createWorkflow(
  'update-review-responses-workflow',
  (input: WorkflowData<UpdateReviewResponsesWorkflowInput>) => {
    const updatedReviewResponses = updateReviewResponseStep(input.responses);

    const emitData = transform({ updatedReviewResponses }, ({ updatedReviewResponses }) => {
      return {
        eventName: 'review_response.updated',
        data: updatedReviewResponses.map(response => ({
          id: response.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(updatedReviewResponses);
  }
);
