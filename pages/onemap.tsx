import { AppLayout } from '@/components/layout/AppLayout';
import { OneMapDashboard } from '@/modules/onemap/OneMapDashboard';

export default function OneMapPage() {
  return (
    <AppLayout>
      <OneMapDashboard />
    </AppLayout>
  );
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};