import { AdminOrder, DetailWidgetProps } from '@medusajs/types';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import NoteWidget from '../components/note';
import { useFeatureEnabled } from '../lib/use-feature-flags';

const OrderNoteWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const enabled = useFeatureEnabled('notes');
  if (!enabled) return null;

  return <NoteWidget entityId={data.id} entityType={'order'} />;
};

export const config = defineWidgetConfig({
  zone: 'order.details.side.before',
});

export default OrderNoteWidget;
