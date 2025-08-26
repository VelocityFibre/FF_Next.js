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

// Business type options (South African legal entities)
export type BusinessType = 'Pty Ltd' | 'CC' | 'Trust' | 'Sole Proprietor';

// South African provinces
export type SAProvince = 
  | 'Eastern Cape'
  | 'Free State'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'Northern Cape'
  | 'North West'
  | 'Western Cape';

// Individual contractor row in import
export interface ContractorImportRow {
  // Core identification (required fields marked with *)
  companyName: string; // Company Name*
  tradingName?: string; // Trading Name
  contactPerson: string; // Contact Person*
  email: string; // Email*
  registrationNumber: string; // Registration Number*
  
  // Contact information
  phone?: string; // Phone
  
  // Business details
  businessType?: BusinessType; // Business Type (dropdown)
  services?: string[]; // Services (multi-select, linked to service templates)
  website?: string; // Website
  
  // Address information (from CSV columns)
  address1?: string; // Address 1
  address2?: string; // Address 2
  suburb?: string; // Suburb
  city?: string; // City
  province?: SAProvince; // Province (dropdown)
  postalCode?: string; // Postal Code
  country?: string; // Country (defaults to South Africa)
  
  // Region of operations (multi-select provinces)
  regionOfOperations?: SAProvince[]; // Region of Operations
  
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