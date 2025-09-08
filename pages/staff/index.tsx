import type { NextPage } from 'next';
import dynamic from 'next/dynamic';

const StaffTable = dynamic(
  () => import('../../src/modules/staff/components/StaffTable').then(mod => mod.StaffTable),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
);

const StaffPage: NextPage = () => {
  return <StaffTable />;
};

export default StaffPage;