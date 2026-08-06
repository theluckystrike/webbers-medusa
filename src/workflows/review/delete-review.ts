import { createWorkflow, WorkflowData, WorkflowResponse } from '@medusajs/workflows-sdk';
import { deleteReviewStep } from './steps/delete-review-step';
import { removeRemoteLinkStep } from '@medusajs/medusa/core-flows';
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

  return new WorkflowResponse(input);
});
