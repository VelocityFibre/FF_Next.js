/**
 * Excel Parser Module - Public API
 * Central exports for Excel parsing functionality
 */

// Export all types
export * from './types';

// Export validation utilities
export {
  validateFile,
  validateBOQItem,
  isEmptyRow,
  isHeaderRow,
  isSummaryRow,
  normalizeUOM,
  parseNumericValue,
  cleanText
} from './validation';

// Export main parser class
export { ExcelParser } from './ExcelParser';

// Export convenience parsing function
export async function parseFile(
  file: File,
  config?: import('./parser/types').ParseConfig,
  onProgress?: (progress: number) => void
): Promise<import('./parser/types').ParseResult> {
  const { ExcelParser } = await import('./ExcelParser');
  const parser = new ExcelParser(config);
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'xlsx':
    case 'xls':
      return parser.parseExcel(file, onProgress);
    case 'csv':
      return parser.parseCSV(file, onProgress);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}