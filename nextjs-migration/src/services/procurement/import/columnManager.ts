/**
 * Column Manager
 * Handles column mapping detection and management
 */

import type { 
  ColumnMapping, 
  ImportWarning 
} from './importTypes';
import { DEFAULT_COLUMN_MAPPING } from './importTypes';
import { detectColumnMapping } from './columnMapping';

export class ColumnManager {
  private columnMapping: ColumnMapping;

  constructor(customColumnMapping?: Partial<ColumnMapping>) {
    this.columnMapping = { ...DEFAULT_COLUMN_MAPPING, ...customColumnMapping } as ColumnMapping;
  }

  /**
   * Auto-detect column mapping from headers
   */
  detectMapping(headers: string[]): {
    mapping: ColumnMapping;
    warnings: ImportWarning[];
  } {
    const warnings: ImportWarning[] = [];

    if (headers.length === 0) {
      throw new Error('No columns detected in file');
    }

    const detectionResult = detectColumnMapping(headers);
    
    if (detectionResult.confidence < 0.3) {
      warnings.push({
        type: 'mapping',
        row: 0,
        message: `Low confidence (${(detectionResult.confidence * 100).toFixed(1)}%) in automatic column detection`,
        suggestion: 'Consider manually reviewing column mappings'
      });
    }

    // Update column mapping with detected columns
    this.columnMapping = { ...this.columnMapping, ...detectionResult.mapping } as ColumnMapping;

    return {
      mapping: this.columnMapping,
      warnings
    };
  }

  /**
   * Set custom column mapping
   */
  setColumnMapping(mapping: Partial<ColumnMapping>): void {
    this.columnMapping = { ...DEFAULT_COLUMN_MAPPING, ...mapping } as ColumnMapping;
  }

  /**
   * Get current column mapping
   */
  getColumnMapping(): ColumnMapping {
    return { ...this.columnMapping };
  }

  /**
   * Validate column mapping completeness
   */
  validateMapping(): {
    isValid: boolean;
    missingColumns: string[];
    warnings: ImportWarning[];
  } {
    const warnings: ImportWarning[] = [];
    const missingColumns: string[] = [];
    
    // Check for required columns
    const requiredColumns = ['item', 'description', 'quantity', 'unit'];
    
    for (const column of requiredColumns) {
      if (!this.columnMapping[column as keyof ColumnMapping]) {
        missingColumns.push(column);
      }
    }

    if (missingColumns.length > 0) {
      warnings.push({
        type: 'mapping',
        row: 0,
        message: `Missing required column mappings: ${missingColumns.join(', ')}`,
        suggestion: 'Ensure all required columns are mapped correctly'
      });
    }

    return {
      isValid: missingColumns.length === 0,
      missingColumns,
      warnings
    };
  }
}