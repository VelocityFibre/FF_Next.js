/**
 * Import Engine - Core Types
 * Shared types for the Excel Import Engine
 */

import { 
  ImportProgress, 
  ImportResult, 
  ProgressCallback, 
  ColumnMapping,
  ParsedBOQItem,
  ImportError,
  ImportWarning
} from '../importTypes';

export interface EngineConfig {
  progressCallback?: ProgressCallback;
  customColumnMapping?: Partial<ColumnMapping>;
  chunkSize?: number;
}

export interface ProcessingOptions {
  chunkSize?: number;
  enableProgressTracking?: boolean;
  skipConsistencyCheck?: boolean;
}

export interface ProcessingContext {
  totalRows: number;
  processedRows: number;
  validItems: ParsedBOQItem[];
  errors: ImportError[];
  warnings: ImportWarning[];
  columnMapping: ColumnMapping;
}

export interface ChunkProcessingResult {
  validItems: ParsedBOQItem[];
  errors: ImportError[];
  warnings: ImportWarning[];
  processedCount: number;
}

export type { 
  ImportProgress, 
  ImportResult, 
  ProgressCallback, 
  ColumnMapping,
  ParsedBOQItem,
  ImportError,
  ImportWarning
};