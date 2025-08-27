/**
 * Contractor Excel Processor
 * Handles Excel file parsing and export operations for contractors
 */

import * as XLSX from 'xlsx';
import { 
  ContractorImportRow, 
  ContractorImportResult, 
  // Export-related constants removed - not used in import processing
} from '@/types/contractor/import.types';
import { Contractor } from '@/types/contractor/base.types';
import { processContractorImportRows } from './rowProcessor';

/**
 * Import contractors from Excel file
 * 🟢 WORKING: Comprehensive Excel import with error handling
 */
export async function importContractorsFromExcel(
  file: File, 
  overwriteExisting: boolean = true
): Promise<ContractorImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Failed to read Excel file data');
        }
        
        const workbook = XLSX.read(data, { 
          type: 'binary',
          cellDates: true,
          cellNF: false,
          cellText: false
        });
        
        if (workbook.SheetNames.length === 0) {
          throw new Error('Excel file contains no sheets');
        }
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (!worksheet) {
          throw new Error('Failed to read Excel worksheet');
        }
        
        // Convert to JSON with proper handling of empty cells
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: '',
          blankrows: false
        });
        
        if (jsonData.length === 0) {
          throw new Error('Excel sheet is empty or contains no valid data');
        }
        
        // Map Excel columns to contractor fields with comprehensive field mapping
        const rows: ContractorImportRow[] = [];
        const parseErrors: Array<{row: number, message: string}> = [];
        
        jsonData.forEach((row: any, index: number) => {
          try {
            // 🟢 WORKING: Flexible field mapping supporting various header formats
            const mappedRow: ContractorImportRow = {
              // Required fields with fallbacks
              companyName: getFieldValue(row, [
                'Company Name', 'company name', 'Company', 'company', 
                'Business Name', 'business name', 'Name', 'name'
              ]),
              contactPerson: getFieldValue(row, [
                'Contact Person', 'contact person', 'Contact Name', 'contact name',
                'Representative', 'representative', 'Contact', 'contact'
              ]),
              email: getFieldValue(row, [
                'Email', 'email', 'Email Address', 'email address',
                'Contact Email', 'contact email', 'E-mail', 'e-mail'
              ]),
              registrationNumber: getFieldValue(row, [
                'Registration Number', 'registration number', 'Reg Number', 'reg number',
                'Company Registration', 'company registration', 'Registration No', 'registration no'
              ]),
              
              // Optional business information
              phone: getFieldValue(row, [
                'Phone', 'phone', 'Phone Number', 'phone number',
                'Contact Phone', 'contact phone', 'Tel', 'tel', 'Telephone', 'telephone'
              ]),
              businessType: getFieldValue(row, [
                'Business Type', 'business type', 'Company Type', 'company type',
                'Entity Type', 'entity type'
              ]),
              industryCategory: getFieldValue(row, [
                'Industry Category', 'industry category', 'Industry', 'industry',
                'Sector', 'sector', 'Category', 'category'
              ]),
              specializations: getFieldValue(row, [
                'Specializations', 'specializations', 'Specialization', 'specialization',
                'Services', 'services', 'Expertise', 'expertise'
              ]),
              
              // Additional contact information
              alternatePhone: getFieldValue(row, [
                'Alternate Phone', 'alternate phone', 'Alternative Phone', 'alternative phone',
                'Secondary Phone', 'secondary phone', 'Mobile', 'mobile', 'Cell', 'cell'
              ]),
              website: getFieldValue(row, [
                'Website', 'website', 'Web Site', 'web site', 'URL', 'url'
              ]),
              
              // Address information
              physicalAddress: getFieldValue(row, [
                'Physical Address', 'physical address', 'Address', 'address',
                'Street Address', 'street address'
              ]),
              postalAddress: getFieldValue(row, [
                'Postal Address', 'postal address', 'Mailing Address', 'mailing address'
              ]),
              city: getFieldValue(row, [
                'City', 'city', 'Town', 'town'
              ]),
              province: getFieldValue(row, [
                'Province', 'province', 'State', 'state'
              ]),
              postalCode: getFieldValue(row, [
                'Postal Code', 'postal code', 'Zip Code', 'zip code', 'ZIP', 'zip'
              ]),
              country: getFieldValue(row, [
                'Country', 'country'
              ]),
              
              // Financial and legal information
              licenseNumber: getFieldValue(row, [
                'License Number', 'license number', 'Licence Number', 'licence number'
              ]),
              insuranceDetails: getFieldValue(row, [
                'Insurance Details', 'insurance details', 'Insurance', 'insurance'
              ]),
              annualTurnover: getFieldValue(row, [
                'Annual Turnover', 'annual turnover', 'Turnover', 'turnover'
              ]),
              creditRating: getFieldValue(row, [
                'Credit Rating', 'credit rating'
              ]),
              paymentTerms: getFieldValue(row, [
                'Payment Terms', 'payment terms'
              ]),
              
              // Banking information
              bankName: getFieldValue(row, [
                'Bank Name', 'bank name', 'Bank', 'bank'
              ]),
              accountNumber: getFieldValue(row, [
                'Account Number', 'account number'
              ]),
              branchCode: getFieldValue(row, [
                'Branch Code', 'branch code'
              ]),
              
              // Additional business information
              yearsInBusiness: getFieldValue(row, [
                'Years in Business', 'years in business', 'Experience', 'experience'
              ]),
              employeeCount: getFieldValue(row, [
                'Employee Count', 'employee count', 'Employees', 'employees',
                'Staff Count', 'staff count'
              ]),
              certifications: getFieldValue(row, [
                'Certifications', 'certifications', 'Certificates', 'certificates'
              ]),
              notes: getFieldValue(row, [
                'Notes', 'notes', 'Comments', 'comments', 'Remarks', 'remarks'
              ]),
              tags: getFieldValue(row, [
                'Tags', 'tags', 'Categories', 'categories'
              ])
            };
            
            // 🟢 WORKING: Validate required fields
            if (!mappedRow.companyName?.trim()) {
              parseErrors.push({
                row: index + 2, // Excel rows start at 1, plus header
                message: 'Missing required field: Company Name'
              });
              return;
            }
            
            if (!mappedRow.email?.trim()) {
              parseErrors.push({
                row: index + 2,
                message: 'Missing required field: Email'
              });
              return;
            }
            
            // 🟢 WORKING: Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(mappedRow.email.trim())) {
              parseErrors.push({
                row: index + 2,
                message: 'Invalid email format'
              });
              return;
            }
            
            rows.push(mappedRow);
            
          } catch (rowError) {
            parseErrors.push({
              row: index + 2,
              message: `Row processing error: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`
            });
          }
        });
        
        // Process valid rows
        const result = await processContractorImportRows(rows, overwriteExisting);
        
        // Add Excel parsing errors to the result
        if (parseErrors.length > 0) {
          result.errors.unshift(...parseErrors.map(err => ({
            row: err.row,
            field: 'excel_parsing',
            message: err.message
          })));
          result.failed += parseErrors.length;
        }
        
        resolve(result);
        
      } catch (error) {
        reject(new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Get field value from row data using multiple possible field names
 * 🟢 WORKING: Flexible field mapping with fallbacks
 */
function getFieldValue(row: any, fieldNames: string[]): string {
  for (const fieldName of fieldNames) {
    if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
      return String(row[fieldName]).trim();
    }
  }
  return '';
}

/**
 * Export contractors to Excel file
 * 🟢 WORKING: Comprehensive contractor export with all fields
 */
export function exportContractorsToExcel(contractors: Contractor[]): Blob {
  try {
    // Prepare data for export with all relevant contractor fields
    const exportData = contractors.map(contractor => ({
      'Company Name': contractor.companyName || '',
      'Contact Person': contractor.contactPerson || '',
      'Email': contractor.email || '',
      'Phone': contractor.phone || '',
      'Registration Number': contractor.registrationNumber || '',
      'Business Type': contractor.businessType || '',
      'Industry Category': contractor.industryCategory || '',
      'Specializations': contractor.specializations?.join(', ') || '',
      'Status': contractor.status || '',
      'Physical Address': contractor.physicalAddress || '',
      'Postal Address': contractor.postalAddress || '',
      'City': contractor.city || '',
      'Province': contractor.province || '',
      'Postal Code': contractor.postalCode || '',
      'Alternate Phone': contractor.alternatePhone || '',
      'Annual Turnover': contractor.annualTurnover || '',
      'Years in Business': contractor.yearsInBusiness || '',
      'Employee Count': contractor.employeeCount || '',
      'Performance Score': contractor.performanceScore || '',
      'Safety Score': contractor.safetyScore || '',
      'Quality Score': contractor.qualityScore || '',
      'RAG Overall': contractor.ragOverall || '',
      'RAG Financial': contractor.ragFinancial || '',
      'RAG Compliance': contractor.ragCompliance || '',
      'RAG Performance': contractor.ragPerformance || '',
      'RAG Safety': contractor.ragSafety || '',
      'Total Projects': contractor.totalProjects || 0,
      'Active Projects': contractor.activeProjects || 0,
      'Completed Projects': contractor.completedProjects || 0,
      'Cancelled Projects': contractor.cancelledProjects || 0,
      'Success Rate': contractor.successRate ? `${contractor.successRate}%` : '',
      'On Time Completion': contractor.onTimeCompletion ? `${contractor.onTimeCompletion}%` : '',
      'Average Project Value': contractor.averageProjectValue || '',
      'Compliance Status': contractor.complianceStatus || '',
      'Onboarding Progress': `${contractor.onboardingProgress || 0}%`,
      'Certifications': contractor.certifications?.join(', ') || '',
      'Tags': contractor.tags?.join(', ') || '',
      'Notes': contractor.notes || '',
      'Last Activity': contractor.lastActivity ? new Date(contractor.lastActivity).toLocaleDateString() : '',
      'Next Review Date': contractor.nextReviewDate ? new Date(contractor.nextReviewDate).toLocaleDateString() : '',
      'Created At': new Date(contractor.createdAt).toLocaleDateString(),
      'Updated At': new Date(contractor.updatedAt).toLocaleDateString()
    }));
    
    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Company Name
      { wch: 20 }, // Contact Person
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Registration Number
      { wch: 15 }, // Business Type
      { wch: 20 }, // Industry Category
      { wch: 25 }, // Specializations
      { wch: 12 }, // Status
      { wch: 30 }, // Physical Address
      { wch: 25 }, // Postal Address
      { wch: 15 }, // City
      { wch: 15 }, // Province
      { wch: 10 }, // Postal Code
      { wch: 15 }, // Alternate Phone
      { wch: 15 }, // Annual Turnover
      { wch: 12 }, // Years in Business
      { wch: 12 }, // Employee Count
      { wch: 12 }, // Performance Score
      { wch: 12 }, // Safety Score
      { wch: 12 }, // Quality Score
      { wch: 10 }, // RAG Overall
      { wch: 12 }, // RAG Financial
      { wch: 12 }, // RAG Compliance
      { wch: 12 }, // RAG Performance
      { wch: 10 }, // RAG Safety
      { wch: 12 }, // Total Projects
      { wch: 12 }, // Active Projects
      { wch: 15 }, // Completed Projects
      { wch: 15 }, // Cancelled Projects
      { wch: 12 }, // Success Rate
      { wch: 15 }, // On Time Completion
      { wch: 18 }, // Average Project Value
      { wch: 15 }, // Compliance Status
      { wch: 15 }, // Onboarding Progress
      { wch: 25 }, // Certifications
      { wch: 20 }, // Tags
      { wch: 30 }, // Notes
      { wch: 15 }, // Last Activity
      { wch: 15 }, // Next Review Date
      { wch: 12 }, // Created At
      { wch: 12 }  // Updated At
    ];
    
    ws['!cols'] = columnWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contractors');
    
    // Generate Excel file as blob
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
  } catch (error) {
    throw new Error(`Failed to export contractors to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}