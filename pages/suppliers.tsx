import { AppLayout } from '../src/components/layout/AppLayout';
import { SuppliersPage } from '../src/modules/suppliers/SuppliersPage';

export default function Suppliers() {
  return (
    <AppLayout>
      <SuppliersPage />
    </AppLayout>
  );
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};