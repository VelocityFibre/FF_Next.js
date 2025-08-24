// Re-export all client detail sections from modular structure
export {
  ClientInfoSection,
  ContactDetailsSection,
  CompanyDetailsSection,
  AddressDetailsSection,
  FinancialDetailsSection,
  ProjectMetricsSection,
  ServiceTypesSection,
  NotesSection
} from './ClientDetailSections/index';

// Export types for external use
export type { SectionProps, StatusBadgeProps } from './ClientDetailSections/index';