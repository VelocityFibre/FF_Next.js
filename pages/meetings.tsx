import { AppLayout } from '@/components/layout/AppLayout';
import { MeetingsDashboard } from '@/modules/meetings/MeetingsDashboard';

export default function MeetingsPage() {
  return (
    <AppLayout>
      <MeetingsDashboard />
    </AppLayout>
  );
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};