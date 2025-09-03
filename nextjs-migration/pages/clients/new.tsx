import type { NextPage } from 'next';
import { ClientForm } from '../../src/modules/clients/components/ClientForm';

const ClientCreatePage: NextPage = () => {
  return (
    <div className="p-6">
      <ClientForm />
    </div>
  );
};

export default ClientCreatePage;