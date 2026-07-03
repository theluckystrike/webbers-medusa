import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading, Button, Text, Prompt, toast } from '@medusajs/ui';
import { DetailWidgetProps, AdminCustomer } from '@medusajs/framework/types';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../lib/sdk';
import { useFeatureEnabled } from '../lib/use-feature-flags';

const CustomerAnonymizeWidget = ({ data }: DetailWidgetProps<AdminCustomer>) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const enabled = useFeatureEnabled('anonymizeCustomer');

  const { data: currentUser } = useQuery({
    queryKey: ['current-admin-user'],
    queryFn: () => sdk.admin.user.me(),
  });

  if (!enabled) {
    return null;
  }

  if (!currentUser?.user?.metadata?.superadmin) {
    return null;
  }

  const onConfirm = async () => {
    setLoading(true);
    try {
      await sdk.client.fetch(`/admin/customers/${data.id}/anonymize`, {
        method: 'POST',
      });
      await queryClient.invalidateQueries({ queryKey: [] });
      toast.success('Customer anonymized');
    } catch (e: any) {
      toast.error(e.message || 'Error anonymizing customer');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">AVG / GDPR</Heading>
      </div>
      <div className="flex flex-col gap-y-3 px-6 py-4">
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Permanently removes all personal data for this customer (AVG/GDPR request). This action cannot be undone.
        </Text>
        <div>
          <Button size="small" variant="danger" onClick={() => setOpen(true)}>
            Anonymize customer
          </Button>
        </div>
      </div>

      <Prompt open={open} onOpenChange={setOpen}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Anonymize customer?</Prompt.Title>
            <Prompt.Description>
              This will permanently remove all personal data: name, address, phone, email, and payment information
              across all orders, carts, and subscriptions. This action cannot be undone.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel disabled={loading}>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={onConfirm} disabled={loading}>
              {loading ? 'Anonymizing...' : 'Anonymize'}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: 'customer.details.side.before',
});

export default CustomerAnonymizeWidget;
