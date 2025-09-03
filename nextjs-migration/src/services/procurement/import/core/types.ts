/**
 * BOQ Import Core Types
 * Type definitions and interfaces for BOQ import processing
 */

import { ProcurementContext } from '../../../../types/procurement/base.types';
import { ParsedBOQItem } from '../../../../lib/utils/excelParser';
import { MatchResult, MappingException } from '../../../../lib/utils/catalogMatcher';

/**
 * Import job status
 */
export type ImportJobStatus = 'queued' | 'parsing' | 'validating' | 'mapping' | 'saving' | 'completed' | 'failed' | 'cancelled';

/**
 * Import configuration
 */
export interface ImportConfig {
  autoApprove: boolean;
  strictValidation: boolean;
  minMappingConfidence: number;
  createNewItems: boolean;
  duplicateHandling: 'skip' | 'merge' | 'replace';
}

/**
 * Import job metadata
 */
export interface ImportJobMetadata {
  totalRows: number;
  processedRows: number;
  validRows: number;
  skippedRows: number;
  autoMappedItems: number;
  exceptionsCount: number;
  parseTime: number;
  mappingTime: number;
  saveTime: number;
}

/**
 * Import job result
 */
export interface ImportJobResult {
  boqId: string;
  itemsCreated: number;
  exceptionsCreated: number;
}

/**
 * Import job definition
 */
export interface ImportJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: ImportJobStatus;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: ImportJobMetadata;
  result?: ImportJobResult;
}

/**
 * Progress callback function
 */
export type ProgressCallback = (
  job: ImportJob,
  stage: string,
  progress: number,
  message?: string
) => void;

/**
 * Import statistics
 */
export interface ImportStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  totalItemsImported: number;
  averageMappingConfidence: number;
  topFailureReasons: Array<{ reason: string; count: number }>;
}

/**
 * Mapping results structure
 */
export interface MappingResults {
  mapped: Array<ParsedBOQItem & { catalogMatch: MatchResult }>;
  exceptions: Array<ParsedBOQItem & { exception: MappingException }>;
}

/**
 * Save operation result
 */
export interface SaveResult {
  boqId: string;
  itemsCreated: number;
  exceptionsCreated: number;
}

/**
 * Job management interface
 */
export interface IJobManager {
  createJob(file: File): ImportJob;
  getJob(jobId: string): ImportJob | undefined;
  updateJob(job: ImportJob): void;
  cancelJob(jobId: string): boolean;
  getActiveJobs(): ImportJob[];
  getJobHistory(): ImportJob[];
  moveToHistory(jobId: string): void;
}

/**
 * Import processor interface
 */
export interface IImportProcessor {
  processImport(
    job: ImportJob,
    file: File,
    context: ProcurementContext,
    config: ImportConfig,
    onProgress?: ProgressCallback
  ): Promise<void>;
}