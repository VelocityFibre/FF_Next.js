import { GetServerSideProps } from 'next';
import { AppLayout } from '../src/components/layout/AppLayout';
import { EnhancedKPIDashboard } from '../src/modules/kpis/EnhancedKPIDashboard';

export default function EnhancedKPIsPage() {
  return (
    <AppLayout>
      <EnhancedKPIDashboard />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}
  };
};