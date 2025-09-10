import type { NextPage } from 'next';
import { StaffDetail } from '../../src/modules/staff/components/StaffDetail';

const StaffDetailPage: NextPage = () => {
  return <StaffDetail />;
};

// Prevent static generation to avoid NextRouter mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default StaffDetailPage;