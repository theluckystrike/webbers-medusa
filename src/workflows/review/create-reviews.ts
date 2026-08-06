import { transform, when } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import { CreateReviewsWorkflowInput } from '../../modules/review/types';
import { refreshProductReviewStatsWorkflow } from './refresh-product-review-stats';
import { createReviewsStep } from './steps/create-reviews';
import { REVIEW_MODULE } from '../../modules/review';
import { Modules } from '@medusajs/framework/utils';
import { createRemoteLinkStep, useQueryGraphStep } from '@medusajs/medusa/core-flows';

export const createReviewsWorkflow = createWorkflow(
  'create-reviews-workflow',
  (input: WorkflowData<CreateReviewsWorkflowInput>) => {
    const reviews = createReviewsStep(input.reviews);

    // Retrieve all slowjuice id's
    const { data: categories } = useQueryGraphStep({
      entity: 'product_category',
      fields: ['id', 'name', 'products.id'],
      filters: {
        id: process.env.SLOWJUICE_CATEGORY_ID,
      },
    });

    const linkedProductIds = when(input, input => !!input?.reviews?.length).then(() => {
      const links = transform({ input, reviews, categories }, ({ input, reviews, categories }) => {
        const slowJuiceProducts = categories?.[0]?.products?.map(p => p.id) ?? [];
        const dailyBoxId = process.env.DAILY_BOX_PRODUCT_ID ?? '';

        return reviews.flatMap((review, index) => {
          const reviewInput = input.reviews[index];
          const productIds = reviewInput.products ?? [];

          const hasSlowJuice = productIds.some(id => slowJuiceProducts.includes(id));
          if (hasSlowJuice && !productIds.includes(dailyBoxId)) {
            productIds.push(dailyBoxId);
          }

          return productIds.map(productId => ({
            [REVIEW_MODULE]: { review_id: review.id },
            [Modules.PRODUCT]: { product_id: productId },
          }));
        });
      });

      const linkResult = createRemoteLinkStep(links);

      return transform({ links, linkResult }, ({ links }) =>
        Array.from(new Set(links.map(link => link[Modules.PRODUCT].product_id)))
      );
    });

    const productIds = transform({ linkedProductIds }, ({ linkedProductIds }) => linkedProductIds ?? []);

    refreshProductReviewStatsWorkflow.runAsStep({
      input: { productIds: productIds },
    });

    const emitData = transform({ reviews }, ({ reviews }) => {
      return {
        eventName: 'review.created',
        data: reviews.map(review => ({
          id: review.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(reviews);
  }
);
