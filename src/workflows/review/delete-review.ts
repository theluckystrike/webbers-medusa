import { createWorkflow, transform, WorkflowData, WorkflowResponse } from '@medusajs/workflows-sdk';
import { deleteReviewStep } from './steps/delete-review-step';
import { emitEventStep, removeRemoteLinkStep } from '@medusajs/medusa/core-flows';
import { REVIEW_MODULE } from '../../modules/review';
import { refreshProductReviewStatsWorkflow } from './refresh-product-review-stats';

export const deleteReviewWorkflow = createWorkflow('delete-review-workflow', (input: WorkflowData<{ id: string }>) => {
  const productIds = deleteReviewStep(input);

  removeRemoteLinkStep([
    {
      [REVIEW_MODULE]: {
        review_id: input.id,
      },
    },
  ]);

  refreshProductReviewStatsWorkflow.runAsStep({
    input: { productIds },
  });

  const emitData = transform({ input }, ({ input }) => {
    return {
      eventName: 'review.deleted',
      data: [{ id: input.id }],
    };
  });

  emitEventStep(emitData);

  return new WorkflowResponse(input);
});
