import { GetServerSideProps } from 'next';
import { AppLayout } from '../src/components/layout/AppLayout';
import { KPIDashboard } from '../src/modules/kpi-dashboard/KPIDashboard';

export default function KPIDashboardPage() {
  return (
    <AppLayout>
      <KPIDashboard />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};