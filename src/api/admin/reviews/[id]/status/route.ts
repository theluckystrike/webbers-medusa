import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { UpdateProductReviewStatusSchema } from './middlewares';
import { updateReviewsWorkflow } from '../../../../../workflows/review/update-reviews';

export const PUT = async (req: AuthenticatedMedusaRequest<UpdateProductReviewStatusSchema>, res: MedusaResponse) => {
  const review_id = req?.params.id;
  const { status } = req?.validatedBody;

  const result = await updateReviewsWorkflow(req.scope).run({
    input: {
      reviews: [
        {
          id: review_id,
          status,
        },
      ],
    },
  });

  res.status(200).json({ product_review: result.result[0] });
};
