import { Copy, Heading, StatusBadge, toast, usePrompt, useToggleState } from '@medusajs/ui';
import { ActionMenu } from '../../../../../components/common/action-menu';
import { CheckCircleSolid, FlagMini, PencilSquare, Trash } from '@medusajs/icons';
import { ReviewGeneralSectionProps } from './types.ts';
import { getReviewstatus } from '../../../../../components/table-cells/common/status-cell';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../../../../../sdk.ts';
import ReviewEditModal from '../review-edit-modal';
import { StarRatingCell } from '../../../page.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { ageOptions, genderOptions } from '../../../components/review-form';

const ReviewGeneralSection = ({ review }: ReviewGeneralSectionProps) => {
  const navigate = useNavigate();
  const dialog = usePrompt();
  const queryClient = useQueryClient();
  const [state, open, close] = useToggleState();
  const { id } = useParams();

  const updateReviewStatus = useMutation({
    mutationFn: async (params: { reviewId: string; status: 'approved' | 'flagged' }) => {
      const { reviewId, status } = params;

      return sdk.client.fetch(`/admin/reviews/${reviewId}/status`, {
        method: 'PUT',
        body: { status: status },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['review', id] });
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review status updated successfully');
    },
    onError: err => {
      console.error(err);
      toast.error('Failed to update review status');
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (params: { reviewId: string }) => {
      const { reviewId } = params;

      return sdk.client.fetch(`/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['review', id] });
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted succesfully');
      navigate('/reviews');
    },
    onError: err => {
      console.error(err);
      toast.error('Failed to update review status');
    },
  });

  const handleRemove = async () => {
    const confirmed = await dialog({
      title: 'Are you sure?',
      description: `You are about to delete this review? This action cannot be undone.`,
    });

    if (!confirmed) {
      return;
    }

    await deleteReview.mutateAsync({ reviewId: review.id });
  };

  const reviewStatus = getReviewstatus(review.status);

  const canApprove = review.status === 'pending' || review.status === 'flagged';
  const canFlag = review.status === 'pending' || review.status === 'approved';

  const isUpdatingThisRow = updateReviewStatus.isPending && updateReviewStatus.variables?.reviewId === review?.id;

  return (
    <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <div className="flex items-center gap-x-1">
            <Heading>{review?.id}</Heading>
            <Copy content={`${review?.id}`} className="text-ui-fg-muted" />
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-1.5">
            <StatusBadge color={reviewStatus.color}>{reviewStatus.label}</StatusBadge>
          </div>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: 'Edit',
                    onClick: open,
                    icon: <PencilSquare />,
                  },
                  {
                    icon: <CheckCircleSolid />,
                    label: 'Approve',
                    disabled: !canApprove || isUpdatingThisRow,
                    onClick: () =>
                      updateReviewStatus.mutate({
                        reviewId: review.id,
                        status: 'approved',
                      }),
                  },
                  {
                    icon: <FlagMini />,
                    label: 'Flag',
                    disabled: !canFlag || isUpdatingThisRow,
                    onClick: () =>
                      updateReviewStatus.mutate({
                        reviewId: review.id,
                        status: 'flagged',
                      }),
                  },
                  {
                    icon: <Trash />,
                    label: 'Delete',
                    onClick: () => handleRemove(),
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
      <div className="w-full p-0 divide-y">
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">Rating</p>
          <p className="font-normal font-sans txt-compact-small">
            {review.rating ? <StarRatingCell rating={review.rating} /> : '-'}
          </p>
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">Name</p>
          <p className="font-normal font-sans txt-compact-small">{review.name ?? '-'}</p>
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">City</p>
          <p className="font-normal font-sans txt-compact-small">{review.city ?? '-'}</p>
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">Age</p>
          <p className="font-normal font-sans txt-compact-small">
            {ageOptions.find(o => o.value === review.age)?.label ?? '-'}
          </p>
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">Gender</p>
          <p className="font-normal font-sans txt-compact-small">
            {genderOptions.find(o => o.value === review.gender)?.label ?? '-'}
          </p>
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">Title</p>
          <p className="font-normal font-sans txt-compact-small">{review.title ?? '-'}</p>
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">Content</p>
          <p className="font-normal font-sans txt-compact-small">{review.content ?? '-'}</p>
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">Recommended</p>
          <p className="font-normal font-sans txt-compact-small">{review.recommend ? 'Yes' : 'No'}</p>
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center py-4 px-6">
          <p className="font-medium font-sans txt-compact-small">Email</p>
          <p className="font-normal font-sans txt-compact-small">{review.email ?? '-'}</p>
        </div>
      </div>
      <ReviewEditModal state={state} close={close} review={review} />
    </div>
  );
};

export default ReviewGeneralSection;
