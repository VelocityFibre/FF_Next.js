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
  alternatePhone?: string; // Alternate Phone
  
  // Business details
  businessType?: string; // Business Type (string for flexibility)
  industryCategory?: string; // Industry Category
  services?: string[]; // Services (multi-select, linked to service templates)
  website?: string; // Website
  yearsInBusiness?: string | number; // Years in Business
  employeeCount?: string | number; // Employee Count
  
  // Address information (from CSV columns)
  address1?: string; // Address 1
  address2?: string; // Address 2
  suburb?: string; // Suburb
  city?: string; // City
  province?: string; // Province (string for flexibility)
  postalCode?: string; // Postal Code
  country?: string; // Country (defaults to South Africa)
  physicalAddress?: string; // Physical Address
  postalAddress?: string; // Postal Address
  
  // Financial information
  annualTurnover?: string | number; // Annual Turnover
  creditRating?: string; // Credit Rating
  paymentTerms?: string; // Payment Terms
  bankName?: string; // Bank Name
  accountNumber?: string; // Account Number
  branchCode?: string; // Branch Code
  
  // Additional fields
  licenseNumber?: string; // License Number
  insuranceDetails?: string; // Insurance Details
  specializations?: string; // Specializations
  certifications?: string; // Certifications
  notes?: string; // Notes
  tags?: string; // Tags
  
  // Region of operations (multi-select provinces)
  regionOfOperations?: SAProvince[]; // Region of Operations
  
  // Import metadata
  rowNumber?: number;
  isValid?: boolean;
  isDuplicate?: boolean;
  errors?: string[];
  warnings?: string[];
}

// Import configuration options
export interface ContractorImportOptions {
  mode: 'skipDuplicates' | 'updateExisting';
  sheetIndex?: number;
  hasHeaders?: boolean;
}

// Import process result
export interface ContractorImportResult {
  success: boolean;
  total: number;
  imported: number;
  failed: number;
  duplicates: number;
  totalProcessed?: number;
  successCount?: number;
  duplicatesSkipped?: number;
  errors: ContractorImportError[];
  contractors: ContractorImportRow[];
  duplicateContractors: ContractorImportRow[];
  importedIds?: string[];
  duration?: number;
}

// Error details for failed imports
export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

// Error details for contractor import (alias for consistency)
export interface ContractorImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}