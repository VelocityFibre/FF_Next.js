import { AppLayout } from '@/components/layout/AppLayout';
import { OneMapDashboard } from '@/src/modules/onemap/OneMapDashboard';

export default function OneMapPage() {
  return (
    <AppLayout>
      <OneMapDashboard />
    </AppLayout>
  );
}