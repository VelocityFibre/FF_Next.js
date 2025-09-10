import type { NextPage } from 'next';
import { ClientForm } from '../../../src/modules/clients/components/ClientForm';

const ClientEditPage: NextPage = () => {
  return (
    <div className="p-6">
      <ClientForm />
    </div>
  );
};

// Disable static generation to prevent Html import and router issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default ClientEditPage;