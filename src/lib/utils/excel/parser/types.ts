/**
 * Excel Parser - Core Types
 * Shared types for the Excel parsing system
 */

export interface ParseConfig {
  headerRow?: number;
  skipRows?: number;
  strictValidation?: boolean;
  locale?: string;
  validateFormulas?: boolean;
  columnMapping?: Record<string, string>;
}

export interface ColumnMapping {
  source: string;
  target: keyof ParsedBOQItem;
  required: boolean;
}

export interface RawBOQRow {
  [key: string]: any;
}

export interface ParsedBOQItem {
  lineNumber: number;
  itemCode: string | null;
  description: string;
  uom: string;
  quantity: number;
  phase: string | null;
  task: string | null;
  site: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
  category: string | null;
  subcategory: string | null;
  vendor: string | null;
  remarks: string | null;
  rawData: RawBOQRow;
}

export interface ParseError {
  row: number;
  column: string;
  value: any;
  message: string;
  type: 'parsing' | 'validation' | 'format';
}

export interface ParseWarning {
  row: number;
  column: string;
  value: any;
  message: string;
  type: 'format' | 'range' | 'suggestion';
}

export interface ParseMetadata {
  totalRows: number;
  processedRows: number;
  skippedRows: number;
  invalidRows: number;
  processingTime: number;
  fileType: 'xlsx' | 'csv';
}

export interface ParseResult {
  success: boolean;
  items: ParsedBOQItem[];
  errors: ParseError[];
  warnings: ParseWarning[];
  metadata: ParseMetadata;
}

export interface ProcessingStats {
  totalRows: number;
  processedRows: number;
  skippedRows: number;
}

export type ProgressCallback = (progress: number) => void;