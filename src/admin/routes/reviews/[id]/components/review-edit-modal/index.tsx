import { ReviewEditModalProps } from './types.ts';
import { Button, Drawer, toast } from '@medusajs/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../../../../../sdk.ts';
import { useParams } from 'react-router-dom';
import {
  ReviewFormFields,
  ReviewFormValues,
  ReviewPayload,
  toReviewPayload,
} from '../../../components/review-form';

const ReviewEditModal = ({ state, close, review }: ReviewEditModalProps) => {
  const queryClient = useQueryClient();
  const methods = useForm<ReviewFormValues>({
    defaultValues: {
      rating: review.rating,
      email: review.email,
      title: review.title,
      content: review.content,
      age: review.age,
      name: review.name,
      gender: review.gender,
      recommend: review.recommend ? 'yes' : 'no',
      city: review.city,
    },
  });

  const { id } = useParams();

  const updateReview = useMutation({
    mutationFn: async (params: ReviewPayload) => {
      return sdk.client.fetch(`/admin/reviews/${review.id}`, {
        method: 'PATCH',
        body: params,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['review', id] });
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review updated successfully');
      close();
    },
    onError: err => {
      console.error(err);
      toast.error('Failed to update review');
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    await updateReview.mutateAsync(toReviewPayload(values));
  };

  return (
    <FormProvider {...methods}>
      <Drawer open={state} onOpenChange={close}>
        <Drawer.Content>
          <Drawer.Header>
            <h1 className="font-sans font-medium h1-core">Edit Review</h1>
          </Drawer.Header>

          <Drawer.Body className="overflow-y-auto">
            <ReviewFormFields />
          </Drawer.Body>

          <Drawer.Footer>
            <Button variant="secondary" type="submit" onClick={close} size={'small'}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" onClick={methods.handleSubmit(onSubmit)} size={'small'}>
              Save
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </FormProvider>
  );
};

export default ReviewEditModal;
