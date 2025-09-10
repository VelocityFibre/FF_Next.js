import { AppLayout } from '@/components/layout/AppLayout';
import CommunicationsDashboard from '@/modules/communications/CommunicationsDashboard';

export default function CommunicationsPage() {
  return (
    <AppLayout>
      <CommunicationsDashboard />
    </AppLayout>
  );
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};