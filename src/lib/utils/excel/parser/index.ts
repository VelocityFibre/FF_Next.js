/**
 * Excel Parser - Module Exports
 * Modular Excel and CSV parsing system
 */

// Main parser class
export { ExcelParser } from './excelParser';

// Core components
export { DataProcessor } from './dataProcessor';
export { ColumnMapper } from './columnMapper';
export { ResultBuilder } from './resultBuilder';
export { 
  ExcelFileHandler, 
  CSVFileHandler, 
  FileTypeDetector 
} from './fileHandlers';

// Types
export type {
  ParseConfig,
  ColumnMapping,
  RawBOQRow,
  ParsedBOQItem,
  ParseError,
  ParseWarning,
  ParseMetadata,
  ParseResult,
  ProcessingStats,
  ProgressCallback
} from './types';

// Legacy compatibility - maintain backward compatibility
export { ExcelParser as default } from './excelParser';