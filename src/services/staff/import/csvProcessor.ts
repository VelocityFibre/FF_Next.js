/**
 * CSV Processor
 * Handles CSV file parsing and processing
 */

import { StaffImportRow, StaffImportResult } from '@/types/staff.types';
import { DEFAULT_HEADER_MAPPING } from './types';
import { processImportRows } from './rowProcessor';

/**
 * Import staff from CSV file
 */
export async function importFromCSV(file: File, overwriteExisting: boolean = true): Promise<StaffImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        console.log('CSV Headers found:', headers);
        console.log('Header mapping will be:', headers.map(h => `${h} -> ${DEFAULT_HEADER_MAPPING[h] || 'unmapped'}`));
        
        const rows: StaffImportRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          
          headers.forEach((header, index) => {
            // Use mapped header name if available, otherwise convert to lowercase
            const fieldName = DEFAULT_HEADER_MAPPING[header] || header.toLowerCase().replace(/\s+/g, '');
            row[fieldName] = values[index] || '';
          });
          
          // Debug logging for first few rows
          if (i <= 3) {
            console.log(`Row ${i + 1} headers:`, headers);
            console.log(`Row ${i + 1} values:`, values);
            console.log(`Row ${i + 1} data:`, row);
            console.log(`Row ${i + 1} employeeId:`, row.employeeId);
            console.log(`Row ${i + 1} name:`, row.name);
          }
          
          rows.push(row as StaffImportRow);
        }
        
        const result = await processImportRows(rows, overwriteExisting);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
}