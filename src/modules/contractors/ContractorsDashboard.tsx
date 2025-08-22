/**
 * ContractorsDashboard - Main contractors module entry point
 * Updated to use new ContractorList component with real data integration
 */

import { ContractorList } from './components/ContractorList';

export function ContractorsDashboard() {
  return <ContractorList />;
}

export default ContractorsDashboard;