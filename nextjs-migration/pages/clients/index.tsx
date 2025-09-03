import type { NextPage } from 'next';
import { ClientList } from '../../src/modules/clients/components/ClientList';

const ClientsPage: NextPage = () => {
  return <ClientList />;
};

export default ClientsPage;