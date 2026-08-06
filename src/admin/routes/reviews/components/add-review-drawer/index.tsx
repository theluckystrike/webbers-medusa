import { AddReviewDrawerProps } from './types.ts';
import { FormProvider, useForm } from 'react-hook-form';
import { Button, Drawer, toast } from '@medusajs/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../../../../sdk.ts';
import { ReviewFormFields, ReviewFormValues, ReviewPayload, toReviewPayload } from '../review-form';

const AddReviewDrawer = ({ state, onClose }: AddReviewDrawerProps) => {
  const queryClient = useQueryClient();
  const methods = useForm<ReviewFormValues>({});

  const createReview = useMutation({
    mutationFn: async (params: ReviewPayload) => {
      return sdk.client.fetch(`/admin/reviews`, {
        method: 'POST',
        body: { ...params, type: 'product' },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review created successfully');
      methods.reset();
      onClose();
    },
    onError: err => {
      console.log(err);
      toast.error('Failed to create review');
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    await createReview.mutateAsync(toReviewPayload(values));
  };

  return (
    <FormProvider {...methods}>
      <Drawer open={state} onOpenChange={onClose}>
        <Drawer.Content>
          <Drawer.Header>
            <h1 className="font-sans font-medium h1-core">Create Review</h1>
          </Drawer.Header>

          <Drawer.Body className="overflow-y-auto">
            <ReviewFormFields />
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" type="button" onClick={onClose} size={'small'}>
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

export default AddReviewDrawer;
