import { AppLayout } from '@/components/layout/AppLayout';
import { ActionItemsDashboard } from '@/modules/action-items/ActionItemsDashboard';

export default function ActionItemsPage() {
  return (
    <AppLayout>
      <ActionItemsDashboard />
    </AppLayout>
  );
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};