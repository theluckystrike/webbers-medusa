import { MedusaRequest } from '@medusajs/framework/http';
import { PostAdminUpdateReview } from './validators';
import { updateReviewsWorkflow } from '../../../../workflows/review/update-reviews';
import { z } from '@medusajs/framework/zod';
import { MedusaResponse } from '@medusajs/framework';
import { deleteReviewWorkflow } from '../../../../workflows/review/delete-review';

type PostAdminUpdateReviewType = z.infer<typeof PostAdminUpdateReview>;

export const PATCH = async (req: MedusaRequest<PostAdminUpdateReviewType>, res: MedusaResponse) => {
  const reviewUpdate = req.validatedBody;

  const review = {
    id: req.params.id,
    ...reviewUpdate,
  };

  review.remove_product_ids = undefined;
  review.add_product_ids = undefined;

  const { result } = await updateReviewsWorkflow(req.scope).run({
    input: {
      reviews: [review],
      add_product_ids: reviewUpdate.add_product_ids ?? [],
      remove_product_ids: reviewUpdate.remove_product_ids ?? [],
    },
  });

  res.json({ reviews: result });
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await deleteReviewWorkflow(req.scope).run({
    input: {
      id: req.params.id,
    },
  });

  res.json({ reviews: result });
};
