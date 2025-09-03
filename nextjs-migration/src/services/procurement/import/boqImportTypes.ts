/**
 * BOQ Import Types & Interfaces
 * Type definitions for BOQ import workflow
 */

// Import job status
export type ImportJobStatus = 
  | 'queued'
  | 'parsing'
  | 'mapping'
  | 'validating'
  | 'saving'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Import job
export interface ImportJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: ImportJobStatus;
  progress: number; // 0-100
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: {
    totalRows: number;
    processedRows: number;
    validRows: number;
    skippedRows: number;
    autoMappedItems: number;
    exceptionsCount: number;
    parseTime: number;
    mappingTime: number;
    saveTime: number;
  };
  result?: {
    boqId: string;
    itemsCreated: number;
    exceptionsCreated: number;
  };
}

// Import configuration
export interface ImportConfig {
  autoApprove: boolean; // Auto-approve BOQ if confidence is high
  strictValidation: boolean; // Use strict validation mode
  minMappingConfidence: number; // Minimum confidence for auto-mapping
  createNewItems: boolean; // Create new catalog items for unmapped items
  duplicateHandling: 'skip' | 'update' | 'create_new';
  headerRow?: number;
  skipRows?: number;
  columnMapping?: Record<string, string>;
}

// Progress callback type
export type ProgressCallback = (
  job: ImportJob,
  stage: string,
  progress: number,
  message?: string
) => void;

// Import statistics
export interface ImportStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  totalItemsImported: number;
  averageMappingConfidence: number;
  topFailureReasons: { reason: string; count: number }[];
}

// Import workflow stage
export interface ImportStage {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

// Import validation result
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}