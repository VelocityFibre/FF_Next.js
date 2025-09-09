import { AppLayout } from '@/components/layout/AppLayout';
import CommunicationsDashboard from '@/src/modules/communications/CommunicationsDashboard';

export default function CommunicationsPage() {
  return (
    <AppLayout>
      <CommunicationsDashboard />
    </AppLayout>
  );
}