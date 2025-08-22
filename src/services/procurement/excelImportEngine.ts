import * as XLSX from 'xlsx';
import { z } from 'zod';

// Types for Excel Import Engine
export interface ImportProgress {
  phase: 'parsing' | 'validating' | 'mapping' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  processedRows: number;
  totalRows: number;
  message: string;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  type: 'validation' | 'mapping' | 'processing' | 'system';
  row: number;
  column?: string;
  message: string;
  details?: any;
}

export interface ImportWarning {
  type: 'mapping' | 'validation' | 'data';
  row: number;
  column?: string;
  message: string;
  suggestion?: string;
}

export interface ParsedBOQItem {
  lineNumber: number;
  itemCode?: string;
  description: string;
  category?: string;
  quantity: number;
  uom: string;
  unitPrice?: number;
  totalPrice?: number;
  phase?: string;
  task?: string;
  site?: string;
  rawData: Record<string, any>;
}

export interface ImportResult {
  success: boolean;
  data: ParsedBOQItem[];
  errors: ImportError[];
  warnings: ImportWarning[];
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
  };
}

// Configuration for column mapping
export interface ColumnMapping {
  [key: string]: string[];
}

export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  lineNumber: ['line_number', 'line number', 'item_no', 'item no', 'row', '#', 'no'],
  itemCode: ['item_code', 'item code', 'code', 'part_number', 'part number', 'sku'],
  description: ['description', 'item_description', 'item description', 'details', 'product'],
  category: ['category', 'group', 'type', 'class', 'section'],
  quantity: ['quantity', 'qty', 'amount', 'count', 'number'],
  uom: ['uom', 'unit', 'units', 'unit_of_measure', 'unit of measure', 'measure'],
  unitPrice: ['unit_price', 'unit price', 'price', 'rate', 'cost', 'unit_cost', 'unit cost'],
  totalPrice: ['total_price', 'total price', 'total', 'total_cost', 'total cost', 'amount'],
  phase: ['phase', 'stage', 'milestone'],
  task: ['task', 'activity', 'work_package', 'work package'],
  site: ['site', 'location', 'area', 'zone', 'region']
};

// Validation schema for BOQ items
const BOQItemValidationSchema = z.object({
  lineNumber: z.number().positive(),
  itemCode: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  category: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  uom: z.string().min(1, 'Unit of measure is required').max(20, 'Unit of measure too long'),
  unitPrice: z.number().optional(),
  totalPrice: z.number().optional(),
  phase: z.string().optional(),
  task: z.string().optional(),
  site: z.string().optional()
});

/**
 * Excel Import Engine for BOQ files
 * Supports streaming processing for large files with progress tracking
 */
export class ExcelImportEngine {
  private progressCallback?: (progress: ImportProgress) => void;
  private columnMapping: ColumnMapping;

  constructor(
    progressCallback?: (progress: ImportProgress) => void,
    customColumnMapping?: Partial<ColumnMapping>
  ) {
    this.progressCallback = progressCallback;
    this.columnMapping = { ...DEFAULT_COLUMN_MAPPING, ...customColumnMapping };
  }

  /**
   * Parse Excel or CSV file and return structured BOQ data
   */
  async parseFile(file: File): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      data: [],
      errors: [],
      warnings: [],
      stats: {
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
        warningRows: 0
      }
    };

    try {
      this.updateProgress({
        phase: 'parsing',
        progress: 0,
        processedRows: 0,
        totalRows: 0,
        message: 'Reading file...',
        errors: [],
        warnings: []
      });

      // Read file based on type
      const rawData = await this.readFile(file);
      
      this.updateProgress({
        phase: 'parsing',
        progress: 25,
        processedRows: 0,
        totalRows: rawData.length,
        message: `Parsed ${rawData.length} rows from file`,
        errors: [],
        warnings: []
      });

      // Detect and map columns
      const columnMap = this.detectColumns(rawData[0] || {});
      if (Object.keys(columnMap).length === 0) {
        result.errors.push({
          type: 'parsing',
          row: 1,
          message: 'Could not detect any valid columns in the file'
        });
        return result;
      }

      this.updateProgress({
        phase: 'validating',
        progress: 40,
        processedRows: 0,
        totalRows: rawData.length,
        message: 'Validating data structure...',
        errors: [],
        warnings: []
      });

      // Process rows with streaming approach
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const processedItem = this.processRow(row, columnMap, i + 1);
        
        if (processedItem.success) {
          result.data.push(processedItem.data);
          result.stats.validRows++;
        } else {
          result.errors.push(...processedItem.errors);
          result.stats.errorRows++;
        }

        if (processedItem.warnings.length > 0) {
          result.warnings.push(...processedItem.warnings);
          result.stats.warningRows++;
        }

        // Update progress every 100 rows or on last row
        if (i % 100 === 0 || i === rawData.length - 1) {
          this.updateProgress({
            phase: 'validating',
            progress: 40 + (i / rawData.length) * 40,
            processedRows: i + 1,
            totalRows: rawData.length,
            message: `Processed ${i + 1} of ${rawData.length} rows`,
            errors: result.errors,
            warnings: result.warnings
          });
        }
      }

      result.stats.totalRows = rawData.length;
      result.success = result.stats.validRows > 0;

      this.updateProgress({
        phase: 'complete',
        progress: 100,
        processedRows: rawData.length,
        totalRows: rawData.length,
        message: `Import complete: ${result.stats.validRows} valid rows, ${result.stats.errorRows} errors`,
        errors: result.errors,
        warnings: result.warnings
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      result.errors.push({
        type: 'system',
        row: 0,
        message: errorMessage
      });

      this.updateProgress({
        phase: 'error',
        progress: 0,
        processedRows: 0,
        totalRows: 0,
        message: `Import failed: ${errorMessage}`,
        errors: result.errors,
        warnings: result.warnings
      });
    }

    return result;
  }

  /**
   * Read file content based on file type
   */
  private async readFile(file: File): Promise<any[]> {
    const fileExtension = file.name.toLowerCase().split('.').pop();

    if (fileExtension === 'csv') {
      return this.readCSVFile(file);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      return this.readExcelFile(file);
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  /**
   * Read CSV file with streaming support
   */
  private async readCSVFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            resolve([]);
            return;
          }

          const headers = this.parseCSVLine(lines[0]);
          const data: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = this.parseCSVLine(lines[i]);
              const row: any = {};
              
              headers.forEach((header, index) => {
                const value = values[index]?.trim() || '';
                row[header] = value;
              });
              
              data.push(row);
            }
          }

          resolve(data);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Read Excel file using XLSX library
   */
  private async readExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Use first sheet by default
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            resolve([]);
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
          });

          if (jsonData.length === 0) {
            resolve([]);
            return;
          }

          // Convert array format to object format
          const headers = jsonData[0] as string[];
          const data: any[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            const rowObj: any = {};

            headers.forEach((header, index) => {
              const value = row[index];
              rowObj[header] = value !== undefined && value !== null ? String(value).trim() : '';
            });

            data.push(rowObj);
          }

          resolve(data);
        } catch (error) {
          reject(new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Detect column mappings from the first row of data
   */
  private detectColumns(firstRow: Record<string, any>): Record<string, string> {
    const detectedColumns: Record<string, string> = {};
    const availableColumns = Object.keys(firstRow);

    // Match each expected field to actual columns
    Object.entries(this.columnMapping).forEach(([field, possibleNames]) => {
      const matchedColumn = this.findMatchingColumn(availableColumns, possibleNames);
      if (matchedColumn) {
        detectedColumns[field] = matchedColumn;
      }
    });

    return detectedColumns;
  }

  /**
   * Find the best matching column name from available columns
   */
  private findMatchingColumn(availableColumns: string[], possibleNames: string[]): string | null {
    // Exact match first
    for (const possible of possibleNames) {
      const exactMatch = availableColumns.find(col => 
        col.toLowerCase().trim() === possible.toLowerCase().trim()
      );
      if (exactMatch) return exactMatch;
    }

    // Partial match
    for (const possible of possibleNames) {
      const partialMatch = availableColumns.find(col => 
        col.toLowerCase().includes(possible.toLowerCase()) ||
        possible.toLowerCase().includes(col.toLowerCase())
      );
      if (partialMatch) return partialMatch;
    }

    return null;
  }

  /**
   * Process a single row of data
   */
  private processRow(
    row: Record<string, any>, 
    columnMap: Record<string, string>, 
    rowNumber: number
  ): {
    success: boolean;
    data: ParsedBOQItem;
    errors: ImportError[];
    warnings: ImportWarning[];
  } {
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    // Extract values using column mapping
    const extractedData: Partial<ParsedBOQItem> = {
      rawData: row
    };

    // Map required and optional fields
    Object.entries(columnMap).forEach(([field, columnName]) => {
      const value = row[columnName];
      
      switch (field) {
        case 'lineNumber':
          extractedData.lineNumber = this.parseNumber(value, rowNumber, 'lineNumber', errors, warnings);
          break;
        case 'description':
          extractedData.description = this.parseString(value, rowNumber, 'description', errors, warnings, true);
          break;
        case 'quantity':
          extractedData.quantity = this.parseNumber(value, rowNumber, 'quantity', errors, warnings, true);
          break;
        case 'uom':
          extractedData.uom = this.parseString(value, rowNumber, 'uom', errors, warnings, true);
          break;
        case 'unitPrice':
          extractedData.unitPrice = this.parseNumber(value, rowNumber, 'unitPrice', errors, warnings);
          break;
        case 'totalPrice':
          extractedData.totalPrice = this.parseNumber(value, rowNumber, 'totalPrice', errors, warnings);
          break;
        default:
          (extractedData as any)[field] = this.parseString(value, rowNumber, field, errors, warnings);
      }
    });

    // Set default line number if not provided
    if (!extractedData.lineNumber) {
      extractedData.lineNumber = rowNumber;
    }

    // Validate required fields
    if (!extractedData.description?.trim()) {
      errors.push({
        type: 'validation',
        row: rowNumber,
        column: 'description',
        message: 'Description is required'
      });
    }

    if (!extractedData.quantity || extractedData.quantity <= 0) {
      errors.push({
        type: 'validation',
        row: rowNumber,
        column: 'quantity',
        message: 'Valid quantity is required'
      });
    }

    if (!extractedData.uom?.trim()) {
      errors.push({
        type: 'validation',
        row: rowNumber,
        column: 'uom',
        message: 'Unit of measure is required'
      });
    }

    // Additional validation using Zod schema
    try {
      BOQItemValidationSchema.parse(extractedData);
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        zodError.errors.forEach(err => {
          errors.push({
            type: 'validation',
            row: rowNumber,
            column: err.path.join('.'),
            message: err.message
          });
        });
      }
    }

    const success = errors.length === 0;
    return {
      success,
      data: extractedData as ParsedBOQItem,
      errors,
      warnings
    };
  }

  /**
   * Parse a numeric value with validation
   */
  private parseNumber(
    value: any, 
    row: number, 
    field: string, 
    errors: ImportError[], 
    warnings: ImportWarning[],
    required: boolean = false
  ): number | undefined {
    if (value === undefined || value === null || value === '') {
      if (required) {
        errors.push({
          type: 'validation',
          row,
          column: field,
          message: `${field} is required`
        });
      }
      return undefined;
    }

    // Handle string numbers
    if (typeof value === 'string') {
      // Remove common formatting characters
      const cleanValue = value.replace(/[,\s]/g, '').replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanValue);
      
      if (isNaN(parsed)) {
        errors.push({
          type: 'validation',
          row,
          column: field,
          message: `Invalid number format: ${value}`
        });
        return undefined;
      }
      
      if (cleanValue !== value) {
        warnings.push({
          type: 'data',
          row,
          column: field,
          message: `Number format cleaned: '${value}' -> ${parsed}`,
          suggestion: `Consider using standard number format`
        });
      }
      
      return parsed;
    }

    if (typeof value === 'number') {
      return value;
    }

    errors.push({
      type: 'validation',
      row,
      column: field,
      message: `Expected number, got ${typeof value}: ${value}`
    });
    return undefined;
  }

  /**
   * Parse a string value with validation
   */
  private parseString(
    value: any, 
    row: number, 
    field: string, 
    errors: ImportError[], 
    warnings: ImportWarning[],
    required: boolean = false
  ): string | undefined {
    if (value === undefined || value === null || value === '') {
      if (required) {
        errors.push({
          type: 'validation',
          row,
          column: field,
          message: `${field} is required`
        });
      }
      return undefined;
    }

    const stringValue = String(value).trim();
    
    if (required && !stringValue) {
      errors.push({
        type: 'validation',
        row,
        column: field,
        message: `${field} cannot be empty`
      });
      return undefined;
    }

    return stringValue;
  }

  /**
   * Update progress callback
   */
  private updateProgress(progress: ImportProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Get file information without processing
   */
  static async getFileInfo(file: File): Promise<{
    name: string;
    size: number;
    type: string;
    estimatedRows: number;
    worksheets?: string[];
  }> {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (fileExtension === 'csv') {
      // For CSV, estimate rows by file size
      const estimatedRows = Math.floor(file.size / 100); // Rough estimate
      return {
        name: file.name,
        size: file.size,
        type: 'csv',
        estimatedRows
      };
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(data, { type: 'array' });
            
            const worksheets = workbook.SheetNames;
            const firstSheet = workbook.Sheets[worksheets[0]];
            const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1:A1');
            const estimatedRows = range.e.r + 1;

            resolve({
              name: file.name,
              size: file.size,
              type: 'excel',
              estimatedRows,
              worksheets
            });
          } catch (error) {
            reject(new Error(`Failed to analyze Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }
}

// Utility functions for external use
export const createImportEngine = (
  progressCallback?: (progress: ImportProgress) => void,
  customMapping?: Partial<ColumnMapping>
): ExcelImportEngine => {
  return new ExcelImportEngine(progressCallback, customMapping);
};

export { DEFAULT_COLUMN_MAPPING };