import { AppLayout } from '@/components/layout/AppLayout';
import { MeetingsDashboard } from '@/src/modules/meetings/MeetingsDashboard';

export default function MeetingsPage() {
  return (
    <AppLayout>
      <MeetingsDashboard />
    </AppLayout>
  );
}