import { transform, when } from '@medusajs/framework/workflows-sdk';
import { createRemoteLinkStep, emitEventStep, dismissRemoteLinkStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { UpdateReviewsWorkflowInput } from '../../modules/review/types';
import { updateReviewsStep } from './steps/update-reviews';
import { Modules } from '@medusajs/framework/utils';
import { REVIEW_MODULE } from '../../modules/review';
import { refreshProductReviewStatsWorkflow } from './refresh-product-review-stats';
import { getReviewProductIdsStep } from './steps/get-review-product-ids';

export const updateReviewsWorkflow = createWorkflow(
  'update-reviews-workflow',
  (input: WorkflowData<UpdateReviewsWorkflowInput>) => {
    const reviews = updateReviewsStep(input.reviews);

    // Check add_product_ids and remove_product_ids
    when('add-product-review-links', input, input => !!input?.add_product_ids?.length).then(() => {
      const links = transform({ input }, data => {
        return data?.input?.reviews?.flatMap(
          review =>
            data?.input?.add_product_ids?.map(productId => ({
              [REVIEW_MODULE]: {
                review_id: review.id,
              },
              [Modules.PRODUCT]: {
                product_id: productId,
              },
            })) ?? []
        );
      });

      return createRemoteLinkStep(links);
    });

    when('dismiss-product-review-links', input, input => !!input?.remove_product_ids?.length).then(() => {
      const links = transform({ input }, data => {
        return data?.input?.reviews?.flatMap(
          review =>
            data?.input?.remove_product_ids?.map(productId => ({
              [REVIEW_MODULE]: {
                review_id: review.id,
              },
              [Modules.PRODUCT]: {
                product_id: productId,
              },
            })) ?? []
        );
      });
      return dismissRemoteLinkStep(links);
    });

    const reviewIds = transform({ reviews }, ({ reviews }) => {
      return reviews?.map(review => review.id) ?? [];
    });

    const linkedProductIds = getReviewProductIdsStep(reviewIds);

    const productIds = transform({ input, linkedProductIds }, ({ input, linkedProductIds }) => {
      return Array.from(
        new Set([...(linkedProductIds ?? []), ...(input?.remove_product_ids ?? []), ...(input?.add_product_ids ?? [])])
      );
    });

    refreshProductReviewStatsWorkflow.runAsStep({ input: { productIds } });

    const emitData = transform({ reviews }, ({ reviews }) => {
      return {
        eventName: 'review.updated',
        data: reviews.map(productReview => ({
          id: productReview.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(reviews);
  }
);
