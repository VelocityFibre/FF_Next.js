/**
 * Excel Parser Utility for BOQ Import
 * Handles .xlsx and .csv file parsing with streaming support for large files
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { z } from 'zod';

// Raw data structure from Excel/CSV
export interface RawBOQRow {
  lineNumber?: string | number;
  itemCode?: string;
  description?: string;
  uom?: string;
  quantity?: string | number;
  phase?: string;
  task?: string;
  site?: string;
  unitPrice?: string | number;
  totalPrice?: string | number;
  category?: string;
  subcategory?: string;
  vendor?: string;
  remarks?: string;
}

// Parsed and validated BOQ item
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

// Parsing configuration
export interface ParseConfig {
  headerRow?: number; // Row number for headers (0-indexed)
  skipRows?: number; // Number of rows to skip at the top
  maxRows?: number; // Maximum rows to process
  columnMapping?: Record<string, string>; // Custom column mapping
  strictValidation?: boolean; // Strict validation mode
}

// Parse result with metadata
export interface ParseResult {
  items: ParsedBOQItem[];
  errors: ParseError[];
  warnings: ParseWarning[];
  metadata: {
    totalRows: number;
    processedRows: number;
    validRows: number;
    skippedRows: number;
    fileName: string;
    fileSize: number;
    parseTime: number;
  };
}

// Error types
export interface ParseError {
  row: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
  data?: any;
}

export interface ParseWarning {
  row: number;
  column?: string;
  message: string;
  suggestion?: string;
}

// Validation schema for BOQ items
const BOQItemSchema = z.object({
  lineNumber: z.number().positive().int(),
  description: z.string().min(1, 'Description is required'),
  uom: z.string().min(1, 'Unit of measure is required'),
  quantity: z.number().positive('Quantity must be positive'),
  itemCode: z.string().nullable(),
  phase: z.string().nullable(),
  task: z.string().nullable(),
  site: z.string().nullable(),
  unitPrice: z.number().positive().nullable(),
  totalPrice: z.number().positive().nullable(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  vendor: z.string().nullable(),
  remarks: z.string().nullable(),
});

// Common column name variations for mapping
const COLUMN_MAPPINGS = {
  lineNumber: ['line', 'line_number', 'item_no', 'sl_no', 'sr_no', 'sno', '#'],
  itemCode: ['item_code', 'code', 'material_code', 'part_no', 'sku'],
  description: ['description', 'item_description', 'material', 'item', 'details'],
  uom: ['uom', 'unit', 'units', 'measure', 'um'],
  quantity: ['quantity', 'qty', 'amount'],
  phase: ['phase', 'work_phase', 'stage'],
  task: ['task', 'activity', 'work_task'],
  site: ['site', 'location', 'area'],
  unitPrice: ['unit_price', 'rate', 'price', 'cost'],
  totalPrice: ['total_price', 'total', 'amount', 'value'],
  category: ['category', 'group', 'class'],
  subcategory: ['subcategory', 'subgroup', 'subclass'],
  vendor: ['vendor', 'supplier', 'manufacturer'],
  remarks: ['remarks', 'notes', 'comments']
};

export class ExcelParser {
  private config: ParseConfig;
  private errors: ParseError[] = [];
  private warnings: ParseWarning[] = [];

  constructor(config: ParseConfig = {}) {
    this.config = {
      headerRow: 0,
      skipRows: 0,
      maxRows: 10000,
      strictValidation: false,
      ...config
    };
  }

  /**
   * Parse Excel (.xlsx) file
   */
  async parseExcel(file: File, onProgress?: (progress: number) => void): Promise<ParseResult> {
    const startTime = Date.now();
    this.resetErrors();

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Use first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      if (!worksheet) {
        throw new Error('No worksheets found in the Excel file');
      }

      // Convert to JSON with header detection
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      }) as string[][];

      return this.processRawData(rawData, file, startTime, onProgress);
    } catch (error) {
      this.addError(0, '', `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'PARSE_ERROR');
      return this.buildResult([], file, startTime);
    }
  }

  /**
   * Parse CSV file
   */
  async parseCSV(file: File, onProgress?: (progress: number) => void): Promise<ParseResult> {
    const startTime = Date.now();
    this.resetErrors();

    return new Promise((resolve) => {
      const results: string[][] = [];
      let rowCount = 0;

      Papa.parse(file, {
        chunk: (chunk) => {
          results.push(...chunk.data as string[][]);
          rowCount += chunk.data.length;
          onProgress?.(Math.min(rowCount / 1000, 0.8)); // Estimate progress
        },
        complete: () => {
          onProgress?.(0.9);
          const result = this.processRawData(results, file, startTime, onProgress);
          resolve(result);
        },
        error: (error) => {
          this.addError(0, '', `Failed to parse CSV file: ${error.message}`, 'PARSE_ERROR');
          resolve(this.buildResult([], file, startTime));
        },
        skipEmptyLines: true,
        header: false
      });
    });
  }

  /**
   * Process raw data array into structured BOQ items
   */
  private processRawData(
    rawData: string[][],
    file: File,
    startTime: number,
    onProgress?: (progress: number) => void
  ): ParseResult {
    if (rawData.length === 0) {
      this.addError(0, '', 'File is empty or contains no valid data', 'EMPTY_FILE');
      return this.buildResult([], file, startTime);
    }

    // Detect headers
    const headerRow = this.detectHeaders(rawData);
    const columnMapping = this.mapColumns(headerRow);

    // Process data rows
    const dataRows = rawData.slice((this.config.headerRow || 0) + 1 + (this.config.skipRows || 0));
    const maxRows = Math.min(dataRows.length, this.config.maxRows || 10000);
    
    const items: ParsedBOQItem[] = [];
    let processedRows = 0;

    for (let i = 0; i < maxRows; i++) {
      const row = dataRows[i];
      const rowIndex = i + (this.config.headerRow || 0) + 1 + (this.config.skipRows || 0);
      
      try {
        const rawItem = this.mapRowToObject(row, columnMapping);
        const parsedItem = this.parseAndValidateItem(rawItem, rowIndex);
        
        if (parsedItem) {
          items.push(parsedItem);
        }
        
        processedRows++;
        
        // Update progress
        if (onProgress && i % 100 === 0) {
          onProgress(0.9 + (i / maxRows) * 0.1);
        }
      } catch (error) {
        this.addError(
          rowIndex,
          '',
          `Failed to process row: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'ROW_PROCESSING_ERROR'
        );
      }
    }

    onProgress?.(1.0);
    return this.buildResult(items, file, startTime, processedRows, rawData.length);
  }

  /**
   * Detect headers from the first few rows
   */
  private detectHeaders(rawData: string[][]): string[] {
    const headerRowIndex = this.config.headerRow || 0;
    if (headerRowIndex >= rawData.length) {
      this.addError(0, '', 'Header row index exceeds file length', 'INVALID_HEADER');
      return [];
    }

    return rawData[headerRowIndex].map(header => 
      String(header).toLowerCase().trim().replace(/[\s_-]+/g, '_')
    );
  }

  /**
   * Map detected columns to BOQ fields
   */
  private mapColumns(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {};

    // Custom mapping override
    if (this.config.columnMapping) {
      Object.entries(this.config.columnMapping).forEach(([field, columnName]) => {
        const index = headers.findIndex(h => h === columnName.toLowerCase().trim());
        if (index !== -1) {
          mapping[field] = index;
        }
      });
    }

    // Auto-detect common column patterns
    Object.entries(COLUMN_MAPPINGS).forEach(([field, variations]) => {
      if (mapping[field] !== undefined) return; // Skip if already mapped

      for (const variation of variations) {
        const index = headers.findIndex(h => 
          h.includes(variation.toLowerCase()) || 
          this.fuzzyMatch(h, variation.toLowerCase(), 0.8)
        );
        
        if (index !== -1) {
          mapping[field] = index;
          break;
        }
      }
    });

    // Validate required columns
    const requiredFields = ['description', 'uom', 'quantity'];
    const missingFields = requiredFields.filter(field => mapping[field] === undefined);
    
    if (missingFields.length > 0) {
      this.addError(0, '', `Missing required columns: ${missingFields.join(', ')}`, 'MISSING_COLUMNS');
    }

    return mapping;
  }

  /**
   * Map row array to object using column mapping
   */
  private mapRowToObject(row: string[], columnMapping: Record<string, number>): RawBOQRow {
    const obj: RawBOQRow = {};

    Object.entries(columnMapping).forEach(([field, index]) => {
      if (index < row.length) {
        const value = row[index]?.trim();
        if (value) {
          obj[field as keyof RawBOQRow] = value;
        }
      }
    });

    return obj;
  }

  /**
   * Parse and validate individual BOQ item
   */
  private parseAndValidateItem(rawItem: RawBOQRow, rowIndex: number): ParsedBOQItem | null {
    try {
      // Skip empty rows
      if (!rawItem.description?.trim()) {
        return null;
      }

      // Parse numeric values
      const parsedItem: Partial<ParsedBOQItem> = {
        lineNumber: this.parseNumber(rawItem.lineNumber) || rowIndex,
        itemCode: rawItem.itemCode?.trim() || null,
        description: rawItem.description?.trim() || '',
        uom: rawItem.uom?.trim() || '',
        quantity: this.parseNumber(rawItem.quantity) || 0,
        phase: rawItem.phase?.trim() || null,
        task: rawItem.task?.trim() || null,
        site: rawItem.site?.trim() || null,
        unitPrice: this.parseNumber(rawItem.unitPrice) || null,
        totalPrice: this.parseNumber(rawItem.totalPrice) || null,
        category: rawItem.category?.trim() || null,
        subcategory: rawItem.subcategory?.trim() || null,
        vendor: rawItem.vendor?.trim() || null,
        remarks: rawItem.remarks?.trim() || null,
        rawData: rawItem
      };

      // Validate using Zod schema
      if (this.config.strictValidation) {
        const validation = BOQItemSchema.safeParse(parsedItem);
        if (!validation.success) {
          validation.error.issues.forEach(issue => {
            this.addError(
              rowIndex,
              issue.path.join('.'),
              issue.message,
              'VALIDATION_ERROR',
              issue
            );
          });
          return null;
        }
      } else {
        // Lenient validation with warnings
        if (!parsedItem.description) {
          this.addWarning(rowIndex, 'description', 'Missing description');
        }
        if (!parsedItem.uom) {
          this.addWarning(rowIndex, 'uom', 'Missing unit of measure');
        }
        if (!parsedItem.quantity || parsedItem.quantity <= 0) {
          this.addWarning(rowIndex, 'quantity', 'Invalid or missing quantity');
        }
      }

      return parsedItem as ParsedBOQItem;
    } catch (error) {
      this.addError(
        rowIndex,
        '',
        `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_ERROR'
      );
      return null;
    }
  }

  /**
   * Parse string to number with error handling
   */
  private parseNumber(value: string | number | undefined): number | null {
    if (typeof value === 'number') return value;
    if (!value) return null;

    const stringValue = String(value).trim();
    if (!stringValue) return null;

    // Remove common non-numeric characters
    const cleaned = stringValue.replace(/[,\s$£€¥]/g, '');
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Fuzzy string matching for column detection
   */
  private fuzzyMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return true;
    
    const distance = this.levenshteinDistance(longer, shorter);
    const similarity = (longer.length - distance) / longer.length;
    
    return similarity >= threshold;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Add parsing error
   */
  private addError(row: number, column: string, message: string, code: string, data?: any): void {
    this.errors.push({
      row,
      column,
      message,
      severity: 'error',
      code,
      data
    });
  }

  /**
   * Add parsing warning
   */
  private addWarning(row: number, column: string, message: string, suggestion?: string): void {
    this.warnings.push({
      row,
      column,
      message,
      suggestion
    });
  }

  /**
   * Reset errors and warnings
   */
  private resetErrors(): void {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Build final parse result
   */
  private buildResult(
    items: ParsedBOQItem[],
    file: File,
    startTime: number,
    processedRows?: number,
    totalRows?: number
  ): ParseResult {
    const parseTime = Date.now() - startTime;
    
    return {
      items,
      errors: this.errors,
      warnings: this.warnings,
      metadata: {
        totalRows: totalRows || 0,
        processedRows: processedRows || 0,
        validRows: items.length,
        skippedRows: (processedRows || 0) - items.length,
        fileName: file.name,
        fileSize: file.size,
        parseTime
      }
    };
  }
}

/**
 * Utility function to parse file based on extension
 */
export async function parseFile(
  file: File,
  config?: ParseConfig,
  onProgress?: (progress: number) => void
): Promise<ParseResult> {
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

/**
 * Validate file before parsing
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv' // csv
  ];

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
    return { valid: false, error: 'Please upload an Excel (.xlsx, .xls) or CSV file' };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  return { valid: true };
}