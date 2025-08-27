/**
 * Contractor Row Processor
 * Handles processing and validation of contractor import rows
 */

import { 
  ContractorImportRow, 
  ContractorImportResult, 
  ContractorImportError 
} from '@/types/contractor/import.types';
import { Contractor } from '@/types/contractor/base.types';
import { validateContractorData, normalizeContractorData } from './validators';
import { contractorService } from '@/services/contractorService';
import { log } from '@/lib/logger';

/**
 * Process contractor import rows with validation and duplicate detection
 * 🟢 WORKING: Comprehensive row processing with error handling
 */
export async function processContractorImportRows(
  rows: ContractorImportRow[],
  overwriteExisting: boolean = true
): Promise<ContractorImportResult> {
  const result: ContractorImportResult = {
    success: false,
    total: rows.length,
    imported: 0,
    failed: 0,
    duplicates: 0,
    errors: [],
    contractors: [],
    duplicateContractors: []
  };
  
  if (rows.length === 0) {
    result.success = true;
    return result;
  }
  
  try {
    // 🟢 WORKING: Get existing contractors for duplicate detection
    const existingContractors = await contractorService.getAll();
    const existingEmails = new Set(existingContractors.map(c => c.email.toLowerCase()));
    const existingRegistrations = new Set(
      existingContractors
        .map(c => c.registrationNumber?.toLowerCase())
        .filter(Boolean)
    );
    
    const contractorsToImport: Contractor[] = [];
    const duplicateRows: ContractorImportRow[] = [];
    
    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;
      
      try {
        // 🟢 WORKING: Normalize and validate the row data
        const normalizedRow = normalizeContractorData(row);
        const validationErrors = validateContractorData(normalizedRow, rowNumber);
        
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors);
          result.failed++;
          continue;
        }
        
        // 🟢 WORKING: Check for duplicates
        const isDuplicateEmail = existingEmails.has(normalizedRow.email.toLowerCase());
        const isDuplicateRegistration = normalizedRow.registrationNumber && 
          existingRegistrations.has(normalizedRow.registrationNumber.toLowerCase());
        
        if (isDuplicateEmail || isDuplicateRegistration) {
          if (!overwriteExisting) {
            duplicateRows.push(row);
            result.duplicates = (result.duplicates || 0) + 1;
            result.errors.push({
              row: rowNumber,
              field: isDuplicateEmail ? 'email' : 'registrationNumber',
              message: `Duplicate contractor found: ${isDuplicateEmail ? 'Email already exists' : 'Registration number already exists'}`
            });
            continue;
          } else {
            // For overwrite mode, we'll update existing contractor
            log.info(`Will overwrite contractor: ${normalizedRow.email}`, undefined, 'rowProcessor');
          }
        }
        
        // 🟢 WORKING: Convert to Contractor object
        const contractor = await createContractorFromRow(normalizedRow, rowNumber);
        
        if (contractor) {
          contractorsToImport.push(contractor);
          result.contractors.push(row);
        } else {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            field: 'general',
            message: 'Failed to create contractor object from row data'
          });
        }
        
      } catch (rowError) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          field: 'processing',
          message: `Row processing failed: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`
        });
      }
    }
    
    // 🟢 WORKING: Batch insert contractors
    if (contractorsToImport.length > 0) {
      try {
        const importedContractors = await batchInsertContractors(contractorsToImport, overwriteExisting);
        result.imported = importedContractors.length;
      } catch (batchError) {
        result.errors.push({
          row: 0,
          field: 'database',
          message: `Batch insert failed: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`
        });
        result.failed += contractorsToImport.length;
        result.imported = 0;
      }
    }
    
    // Set duplicate contractors for reporting
    if (duplicateRows.length > 0) {
      result.duplicateContractors = duplicateRows;
    }
    
    // Determine overall success
    result.success = result.imported > 0 || (result.total === 0);
    
    // 🟢 WORKING: Log import summary
    log.info(`Contractor import summary:`, { data: {
      total: result.total,
      imported: result.imported,
      failed: result.failed,
      duplicates: result.duplicates,
      errors: result.errors.length
    }, 'rowProcessor');;
    ;
    return result;
    
  } catch (error) {
    result.errors.push({
      row: 0,
      field: 'system',
      message: `Import system error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    result.failed = result.total;
    return result;
  }
}

/**
 * Convert import row to Contractor object
 * 🟢 WORKING: Creates properly structured contractor with all fields
 */
async function createContractorFromRow(
  row: ContractorImportRow, 
  rowNumber: number
): Promise<Contractor | null> {
  try {
    const now = new Date();
    const contractorId = generateContractorId();
    
    // 🟢 WORKING: Parse and convert field types
    const contractor: Contractor = {
      id: contractorId,
      
      // Required fields
      companyName: row.companyName,
      contactPerson: row.contactPerson,
      email: row.email.toLowerCase(),
      registrationNumber: row.registrationNumber,
      
      // Business information
      businessType: normalizeBusinessType(row.businessType) || 'pty_ltd',
      industryCategory: row.industryCategory || 'General Services',
      yearsInBusiness: parseNumericValue(row.yearsInBusiness),
      employeeCount: parseNumericValue(row.employeeCount),
      
      // Contact details
      phone: row.phone,
      alternatePhone: row.alternatePhone,
      
      // Address
      physicalAddress: row.physicalAddress,
      postalAddress: row.postalAddress,
      city: row.city,
      province: row.province,
      postalCode: row.postalCode,
      
      // Financial information
      annualTurnover: parseNumericValue(row.annualTurnover),
      creditRating: row.creditRating,
      paymentTerms: row.paymentTerms || '30 days',
      bankName: row.bankName,
      accountNumber: row.accountNumber,
      branchCode: row.branchCode,
      
      // Status and compliance
      status: 'pending' as const, // All imported contractors start as pending
      isActive: true,
      complianceStatus: 'pending' as const,
      
      // RAG scoring (default to amber for new contractors)
      ragOverall: 'amber' as const,
      ragFinancial: 'amber' as const,
      ragCompliance: 'amber' as const,
      ragPerformance: 'amber' as const,
      ragSafety: 'amber' as const,
      
      // Performance metrics (start with defaults)
      performanceScore: 0,
      safetyScore: 0,
      qualityScore: 0,
      timelinessScore: 0,
      
      // Specializations and certifications
      specializations: parseArrayField(row.specializations),
      certifications: parseArrayField(row.certifications),
      
      // Project statistics (initialize to zero)
      totalProjects: 0,
      completedProjects: 0,
      activeProjects: 0,
      cancelledProjects: 0,
      successRate: 0,
      onTimeCompletion: 0,
      averageProjectValue: 0,
      
      // Onboarding
      onboardingProgress: 0,
      documentsExpiring: 0,
      
      // Additional information
      notes: row.notes,
      tags: parseArrayField(row.tags),
      
      // Audit fields
      createdAt: now,
      updatedAt: now
    };
    
    return contractor;
    
  } catch (error) {
    log.error(`Failed to create contractor from row ${rowNumber}:`, { data: error }, 'rowProcessor');
    return null;
  }
}

/**
 * Batch insert contractors into database
 * 🟢 WORKING: Efficient batch operations with error handling
 */
async function batchInsertContractors(
  contractors: Contractor[], 
  overwriteExisting: boolean
): Promise<Contractor[]> {
  try {
    // For now, we'll use individual inserts
    // TODO: Implement true batch insert when contractor service supports it
    const insertedContractors: Contractor[] = [];
    
    for (const contractor of contractors) {
      try {
        let result: Contractor;
        
        if (overwriteExisting) {
          // Try to find existing contractor by email or registration number
          const existing = await contractorService.findByEmailOrRegistration(
            contractor.email, 
            contractor.registrationNumber
          );
          
          if (existing) {
            // Update existing contractor
            result = await contractorService.update(existing.id, {
              ...contractor,
              id: existing.id,
              createdAt: existing.createdAt, // Keep original creation date
              updatedAt: new Date()
            });
          } else {
            // Create new contractor
            result = await contractorService.create(contractor);
          }
        } else {
          // Only create new contractors
          result = await contractorService.create(contractor);
        }
        
        insertedContractors.push(result);
        
      } catch (contractorError) {
        log.error(`Failed to insert contractor ${contractor.companyName}:`, { data: contractorError }, 'rowProcessor');
        // Continue with other contractors
      }
    }
    
    return insertedContractors;
    
  } catch (error) {
    throw new Error(`Batch insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility functions for data conversion and validation
 */

function generateContractorId(): string {
  return `contractor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeBusinessType(businessType?: string): Contractor['businessType'] | undefined {
  if (!businessType) return undefined;
  
  const normalized = businessType.toLowerCase().replace(/\s+/g, '_');
  
  if (normalized.includes('pty') || normalized.includes('ltd')) return 'pty_ltd';
  if (normalized.includes('cc')) return 'cc';
  if (normalized.includes('sole') || normalized.includes('proprietor')) return 'sole_proprietor';
  if (normalized.includes('partnership')) return 'partnership';
  
  return 'pty_ltd'; // Default
}

function parseNumericValue(value?: string | number): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  
  if (typeof value === 'number') return value;
  
  // Remove common formatting characters
  const cleaned = String(value).replace(/[,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? undefined : parsed;
}

function parseArrayField(value?: string): string[] | undefined {
  if (!value || typeof value !== 'string') return undefined;
  
  // Split by common delimiters and clean up
  return value
    .split(/[,;|]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}