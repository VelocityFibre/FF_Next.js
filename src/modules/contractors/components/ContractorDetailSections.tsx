/**
 * Contractor Detail Sections - Legacy Compatibility Layer
 * @deprecated Use modular components from './ContractorDetailSections' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './ContractorDetailSections' directly
 */

// Re-export everything from the modular structure with legacy naming (fixed circular dependency)
export {
  ContractorInfoSection,
  ContactDetailsSection,
  CompanyDetailsSection,
  AddressDetailsSection,
  FinancialDetailsSection,
  PerformanceMetricsSection,
  ProjectMetricsSection,
  NotesSection
} from './ContractorDetailSections/index';