import type { AuthenticatedMedusaRequest, MedusaContainer, MedusaResponse } from '@medusajs/framework';
import { MedusaError, remoteQueryObjectFromString } from '@medusajs/framework/utils';
import { createReviewResponsesWorkflow } from '../../../../../workflows/review/create-review-responses';
import type { CreateReviewResponseDTO } from './middlewares';
import { updateReviewResponsesWorkflow } from '../../../../../workflows/review/update-review-responses';
import { deleteReviewResponsesWorkflow } from '../../../../../workflows/review/delete-review-responses';
import { Review, ReviewResponse } from '../../../../../modules/review/types';

export const fetchReviewResponse = async (
  container: MedusaContainer,
  filter: { id: string } | { review_id: string }
) => {
  const remoteQuery = container.resolve('remoteQuery');

  const query = remoteQueryObjectFromString({
    entryPoint: 'review_response',
    fields: ['*'],
    variables: {
      ...filter,
    },
  });

  const queryResult = await remoteQuery(query);

  return queryResult[0] as ReviewResponse;
};

export const fetchReviewWithResponse = async (container: MedusaContainer, id: string) => {
  const remoteQuery = container.resolve('remoteQuery');

  const query = remoteQueryObjectFromString({
    entryPoint: '_review',
    fields: ['*', 'response.*'],
    variables: { id },
  });

  const queryResult = await remoteQuery(query);

  return queryResult[0] as Review;
};

export const POST = async (req: AuthenticatedMedusaRequest<CreateReviewResponseDTO>, res: MedusaResponse) => {
  const review_id = req.params.id;

  const { result } = await createReviewResponsesWorkflow(req.scope).run({
    input: {
      responses: [
        {
          review_id,
          content: req.validatedBody.content,
        },
      ],
    },
  });

  const review_response = await fetchReviewResponse(req.scope, { id: result[0].id });

  res.status(200).json({ review_response });
};

export const PUT = async (req: AuthenticatedMedusaRequest<CreateReviewResponseDTO>, res: MedusaResponse) => {
  const review_id = req.params.id;

  const review = await fetchReviewWithResponse(req.scope, review_id);

  if (!review.response) throw new MedusaError(MedusaError.Types.NOT_FOUND, ' review response not found');

  const { result } = await updateReviewResponsesWorkflow(req.scope).run({
    input: {
      responses: [
        {
          id: review.response.id,
          content: req.validatedBody.content,
        },
      ],
    },
  });

  const review_response = await fetchReviewResponse(req.scope, { id: result[0].id });

  res.status(200).json({ review_response });
};

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const review_id = req.params.id;

  const reviewResponse = await fetchReviewResponse(req.scope, { review_id });

  if (!reviewResponse) throw new MedusaError(MedusaError.Types.NOT_FOUND, ' review response not found');

  await deleteReviewResponsesWorkflow(req.scope).run({
    input: {
      ids: [reviewResponse.id],
    },
  });

  res.status(200).json({ message: 'review response deleted' });
};
