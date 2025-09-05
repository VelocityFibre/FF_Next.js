import type { NextPage } from 'next';
import { StaffForm } from '../../src/modules/staff/components/StaffForm';

const StaffCreatePage: NextPage = () => {
  return (
    <div className="p-6">
      <StaffForm />
    </div>
  );
};

export default StaffCreatePage;