/**
 * Contractor Import Types
 * Comprehensive type definitions for contractor import functionality
 */

// Core contractor data structure for import
export interface ContractorImportData {
  contractors: ContractorImportRow[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    duplicateRows: number;
  };
}

// Individual contractor row in import
export interface ContractorImportRow {
  // Core identification
  companyName: string;
  contactPerson: string;
  email: string;
  registrationNumber: string;
  
  // Contact information
  phone?: string;
  alternatePhone?: string;
  website?: string;
  
  // Business details
  businessType?: string;
  industry?: string;
  specializations?: string;
  yearsInBusiness?: number;
  employeeCount?: number;
  
  // Address information
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  
  // Financial & legal
  annualTurnover?: number;
  creditRating?: string;
  paymentTerms?: string;
  licenseNumber?: string;
  insuranceDetails?: string;
  bankDetails?: string;
  
  // Additional data
  certifications?: string;
  notes?: string;
  tags?: string;
  
  // Import metadata
  rowNumber: number;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
  warnings: string[];
}

// Import configuration options
export interface ContractorImportOptions {
  mode: 'skipDuplicates' | 'updateExisting';
  sheetIndex?: number;
  hasHeaders?: boolean;
}

// Import process result
export interface ContractorImportResult {
  totalProcessed: number;
  successCount: number;
  duplicatesSkipped: number;
  errors: ImportError[];
  importedIds: string[];
  duration: number;
}

// Error details for failed imports
export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}