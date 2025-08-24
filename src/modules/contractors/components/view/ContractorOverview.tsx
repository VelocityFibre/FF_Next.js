/**
 * Contractor Overview Component
 * Overview tab content for contractor view
 */

import { Contractor } from '@/types/contractor.types';
import {
  ContactDetailsSection,
  CompanyDetailsSection,
  AddressDetailsSection,
  FinancialDetailsSection,
  PerformanceMetricsSection,
  ProjectMetricsSection,
  NotesSection
} from '../ContractorDetailSections';
import { RAGDashboard } from '../RAGDashboard';

interface ContractorOverviewProps {
  contractor: Contractor;
}

export function ContractorOverview({ contractor }: ContractorOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <ContactDetailsSection contractor={contractor} />
        <CompanyDetailsSection contractor={contractor} />
        <AddressDetailsSection contractor={contractor} />
        <FinancialDetailsSection contractor={contractor} />
        <NotesSection contractor={contractor} />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <PerformanceMetricsSection contractor={contractor} />
        <ProjectMetricsSection contractor={contractor} />
        <RAGDashboard contractorId={contractor.id} />
      </div>
    </div>
  );
}