/**
 * Client Import Service - Modular Export
 * Entry point for all client import operations
 */

// Export parser functions
export {
  parseCSVFile,
  parseExcelFile,
  parseServiceTypes,
  parseTags,
  parseNumber,
  parseEnumValue,
  generateImportTemplate
} from './parser';

// Export validator functions
export {
  validateImportRow,
  validateImportData,
  checkForDuplicates
} from './validator';

// Export processor functions
export {
  processImportRows,
  transformRowToFormData,
  previewImportData
} from './processor';

// Import the functions we need for the service object
import { processImportRows } from './processor';
import { parseEnumValue, parseServiceTypes, parseTags, parseNumber, generateImportTemplate } from './parser';

// Main service object for backward compatibility
export const clientImportService = {
  // File parsing
  importFromCSV: async (file: File) => {
    const { parseCSVFile } = await import('./parser');
    const { processImportRows } = await import('./processor');
    const rows = await parseCSVFile(file);
    return processImportRows(rows);
  },
  
  importFromExcel: async (file: File) => {
    const { parseExcelFile } = await import('./parser');
    const { processImportRows } = await import('./processor');
    const rows = await parseExcelFile(file);
    return processImportRows(rows);
  },
  
  // Data processing
  processImportRows,
  
  // Utility functions
  parseEnumValue,
  parseServiceTypes,
  parseTags,
  parseNumber,
  getImportTemplate: generateImportTemplate
};