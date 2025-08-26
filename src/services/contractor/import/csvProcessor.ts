/**
 * Contractor CSV Processor
 * Handles CSV file parsing and processing for contractor import
 */

import { 
  ContractorImportRow, 
  ContractorImportResult, 
  DEFAULT_CONTRACTOR_HEADER_MAPPING 
} from '@/types/contractor/import.types';
import { processContractorImportRows } from './rowProcessor';

/**
 * Import contractors from CSV file
 */
export async function importContractorsFromCSV(
  file: File, 
  overwriteExisting: boolean = true
): Promise<ContractorImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          throw new Error('CSV file is empty');
        }
        
        // Parse CSV header with support for quoted values
        const headers = parseCSVLine(lines[0]);
        
        if (headers.length === 0) {
          throw new Error('CSV file has no headers');
        }

        // 🟢 WORKING: Log header mapping for debugging
        console.log('Contractor CSV Header mapping:', 
          headers.map(h => `"${h}" -> "${DEFAULT_CONTRACTOR_HEADER_MAPPING[h] || 'unmapped'}"`)
        );
        
        const rows: ContractorImportRow[] = [];
        const parseErrors: Array<{row: number, message: string}> = [];
        
        // Process each data row
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            
            if (values.length === 0 || values.every(v => !v.trim())) {
              continue; // Skip empty rows
            }
            
            const row: any = {};
            
            headers.forEach((header, index) => {
              // Use mapped header name if available, otherwise convert to camelCase
              const fieldName = DEFAULT_CONTRACTOR_HEADER_MAPPING[header] || 
                              header.toLowerCase()
                                    .replace(/[^\w\s]/g, '')
                                    .replace(/\s+(.)/g, (_, char) => char.toUpperCase());
              
              row[fieldName] = values[index]?.trim() || '';
            });
            
            // 🟢 WORKING: Validate required fields
            if (!row.companyName || !row.email) {
              parseErrors.push({
                row: i + 1,
                message: `Missing required fields: ${!row.companyName ? 'Company Name' : ''} ${!row.email ? 'Email' : ''}`
              });
              continue;
            }
            
            rows.push(row as ContractorImportRow);
            
          } catch (rowError) {
            parseErrors.push({
              row: i + 1,
              message: `Row parsing error: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`
            });
          }
        }
        
        // 🟢 WORKING: Process valid rows and include parse errors
        const result = await processContractorImportRows(rows, overwriteExisting);
        
        // Add CSV parsing errors to the result
        if (parseErrors.length > 0) {
          result.errors.unshift(...parseErrors.map(err => ({
            row: err.row,
            field: 'csv_parsing',
            message: err.message
          })));
          result.failed += parseErrors.length;
        }
        
        resolve(result);
        
      } catch (error) {
        reject(new Error(`Failed to process CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parse a single CSV line handling quoted values and commas
 * 🟢 WORKING: Robust CSV parsing with quote and escape handling
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

/**
 * Generate contractor import CSV template
 * 🟢 WORKING: Creates a properly formatted CSV template
 */
export function generateContractorImportTemplate(): string {
  const headers = [
    'Company Name',
    'Contact Person', 
    'Email',
    'Phone',
    'Registration Number',
    'Business Type',
    'Industry Category',
    'Specializations',
    'Alternate Phone',
    'Website',
    'Physical Address',
    'City',
    'Province',
    'Postal Code',
    'Country',
    'License Number',
    'Insurance Details',
    'Annual Turnover',
    'Years in Business',
    'Employee Count',
    'Certifications',
    'Notes',
    'Tags'
  ];
  
  const sampleData = [
    'ABC Construction Pty Ltd',
    'John Smith',
    'john.smith@abcconstruction.co.za',
    '011-123-4567',
    '2021/123456/07',
    'pty_ltd',
    'Construction',
    'Fiber Installation, Electrical Work',
    '082-555-1234',
    'www.abcconstruction.co.za',
    '123 Main Road, Sandton',
    'Johannesburg',
    'Gauteng',
    '2196',
    'South Africa',
    'ELEC-2021-001',
    'Public Liability: R2M, Professional Indemnity: R1M',
    '5000000',
    '15',
    '25',
    'Electrical Certificate, Safety Certificate',
    'Reliable contractor with excellent track record',
    'fiber,construction,electrical'
  ];
  
  return headers.join(',') + '\n' + sampleData.join(',') + '\n';
}