import { AppLayout } from '@/components/layout/AppLayout';
import { ActionItemsDashboard } from '@/src/modules/action-items/ActionItemsDashboard';

export default function ActionItemsPage() {
  return (
    <AppLayout>
      <ActionItemsDashboard />
    </AppLayout>
  );
}