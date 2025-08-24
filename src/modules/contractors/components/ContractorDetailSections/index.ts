/**
 * Contractor Detail Sections - Modular Components
 * Clean export index for all contractor detail section components
 */

// Export types
export type { ContractorSectionProps } from './types';
export { ragColors } from './types';

// Import all section components
import { ContractorInfoSection } from './ContractorInfoSection';
import { ContactDetailsSection } from './ContactDetailsSection';
import { CompanyDetailsSection } from './CompanyDetailsSection';
import { AddressDetailsSection } from './AddressDetailsSection';
import { FinancialDetailsSection } from './FinancialDetailsSection';
import { PerformanceMetricsSection } from './PerformanceMetricsSection';
import { ProjectMetricsSection } from './ProjectMetricsSection';
import { NotesSection } from './NotesSection';

// Export all section components
export { ContractorInfoSection };
export { ContactDetailsSection };
export { CompanyDetailsSection };
export { AddressDetailsSection };
export { FinancialDetailsSection };
export { PerformanceMetricsSection };
export { ProjectMetricsSection };
export { NotesSection };

// Convenient grouped exports
export const ContractorSections = {
  ContractorInfo: ContractorInfoSection,
  ContactDetails: ContactDetailsSection,
  CompanyDetails: CompanyDetailsSection,
  AddressDetails: AddressDetailsSection,
  FinancialDetails: FinancialDetailsSection,
  PerformanceMetrics: PerformanceMetricsSection,
  ProjectMetrics: ProjectMetricsSection,
  Notes: NotesSection,
} as const;