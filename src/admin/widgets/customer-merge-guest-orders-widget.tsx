import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading, Text, Button, Badge, toast } from '@medusajs/ui';
import { DetailWidgetProps, AdminCustomer } from '@medusajs/framework/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../lib/sdk';
import { useFeatureEnabled } from '../lib/use-feature-flags';

type GuestOrdersResponse = { count: number; email: string };
type MergeResponse = { transferred_count: number };

const CustomerMergeGuestOrdersWidget = ({ data }: DetailWidgetProps<AdminCustomer>) => {
  const queryClient = useQueryClient();
  const featureEnabled = useFeatureEnabled('transferGuestOrders');

  const { data: guestData, isLoading } = useQuery<GuestOrdersResponse>({
    queryKey: ['customer-guest-orders', data.id],
    queryFn: () => sdk.client.fetch(`/admin/customers/${data.id}/merge-guest-orders`),
    enabled: data.has_account && featureEnabled,
  });

  const mergeMutation = useMutation<MergeResponse>({
    mutationFn: () =>
      sdk.client.fetch(`/admin/customers/${data.id}/merge-guest-orders`, {
        method: 'POST',
      }),
    onSuccess: async result => {
      await queryClient.invalidateQueries({ queryKey: [] });
      toast.success(`${result.transferred_count} guest order(s) moved to this customer`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to merge guest orders');
    },
  });

  if (!featureEnabled || !data.has_account || isLoading) return null;

  const count = guestData?.count ?? 0;

  if (count === 0) return null;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Guest Orders</Heading>
        <Badge color="orange">{count}</Badge>
      </div>
      <div className="flex flex-col gap-y-3 px-6 py-4">
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          {count} unassigned guest order(s) found for {guestData?.email}. Merge them into this customer account.
        </Text>
        <div>
          <Button
            size="small"
            variant="primary"
            isLoading={mergeMutation.isPending}
            disabled={mergeMutation.isPending}
            onClick={() => mergeMutation.mutate()}
          >
            Merge guest orders
          </Button>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: 'customer.details.side.before',
});

export default CustomerMergeGuestOrdersWidget;
