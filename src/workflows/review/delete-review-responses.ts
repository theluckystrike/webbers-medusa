import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { DeleteReviewResponsesWorkflowInput } from '../../modules/review/types/mutations';
import { deleteReviewResponseStep } from './steps/delete-review-responses';

export const deleteReviewResponsesWorkflow = createWorkflow(
  'delete-review-responses-workflow',
  (input: WorkflowData<DeleteReviewResponsesWorkflowInput>) => {
    const result = deleteReviewResponseStep(input.ids);

    const emitData = transform({ result, input }, ({ result, input }) => {
      return {
        eventName: 'review_response.deleted',
        data: input.ids.map(id => ({
          id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(result);
  }
);
