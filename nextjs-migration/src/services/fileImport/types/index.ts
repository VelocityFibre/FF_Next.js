/**
 * High-Performance File Import Types
 * Comprehensive type system for large-scale file processing
 */

export type FileType = 'csv' | 'xlsx' | 'xls' | 'unknown';

export type ProcessingStrategy = 'direct' | 'worker' | 'streaming';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface FileProcessingOptions {
  maxFileSize: number;
  chunkSize: number;
  useWebWorker: boolean;
  streaming: boolean;
  validationRules: ValidationRule[];
  progressCallback?: (progress: FileProcessingProgress) => void;
  onError?: (error: ProcessingError) => void;
  onWarning?: (warning: ProcessingWarning) => void;
  encoding?: string;
  delimiter?: string;
  skipEmptyLines?: boolean;
  trimWhitespace?: boolean;
}

export interface FileProcessingProgress {
  processedRows: number;
  totalRows: number;
  percentage: number;
  estimatedTimeRemaining: number;
  currentPhase: ProcessingPhase;
  bytesProcessed: number;
  totalBytes: number;
  memoryUsage: MemoryStats;
}

export type ProcessingPhase = 
  | 'initializing'
  | 'reading'
  | 'parsing'
  | 'validating'
  | 'transforming'
  | 'finalizing'
  | 'complete'
  | 'error';

export interface FileProcessingResult<T = unknown> {
  data: T[];
  metadata: FileMetadata;
  errors: ProcessingError[];
  warnings: ProcessingWarning[];
  processingTime: number;
  memoryUsage: MemoryStats;
  rowsProcessed: number;
  rowsSkipped: number;
  isPartial: boolean;
  strategy: ProcessingStrategy;
}

export interface FileMetadata {
  filename: string;
  size: number;
  type: FileType;
  encoding?: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  detectedFormat?: DetectedFormat;
  processingStartTime: Date;
  processingEndTime?: Date;
}

export interface DetectedFormat {
  delimiter?: string;
  quote?: string;
  escape?: string;
  lineTerminator?: string;
  hasHeaders: boolean;
  encoding?: string;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  validator: (value: unknown, row: Record<string, unknown>) => ValidationResult;
  message?: string;
  severity: ValidationSeverity;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestion?: string;
}

export interface ProcessingError {
  type: 'file' | 'parsing' | 'validation' | 'memory' | 'timeout';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details?: string;
  row?: number;
  column?: string;
  code?: string;
  timestamp: Date;
  recoverable: boolean;
}

export interface ProcessingWarning {
  type: 'format' | 'data' | 'performance' | 'compatibility';
  message: string;
  suggestion?: string;
  row?: number;
  column?: string;
  timestamp: Date;
}

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  peakUsage: number;
  gcCount?: number;
}

export interface ChunkProcessingOptions {
  chunkSize: number;
  overlap: number;
  preserveHeaders: boolean;
  progressCallback?: (progress: ChunkProgress) => void;
}

export interface ChunkProgress {
  chunkIndex: number;
  totalChunks: number;
  chunkSize: number;
  rowsInChunk: number;
  memoryUsage: MemoryStats;
}

export interface StreamProcessingOptions extends FileProcessingOptions {
  highWaterMark: number;
  objectMode: boolean;
  transform?: (chunk: unknown[]) => Promise<unknown[]>;
}

export interface ProcessorConfig {
  type: FileType;
  strategy: ProcessingStrategy;
  options: FileProcessingOptions;
  fallbackStrategy?: ProcessingStrategy;
  timeoutMs: number;
}

export interface WorkerMessage {
  id: string;
  type: 'process' | 'progress' | 'result' | 'error' | 'cancel';
  payload?: unknown;
  timestamp: Date;
}

export interface WorkerResponse {
  id: string;
  type: 'progress' | 'result' | 'error' | 'complete';
  payload?: unknown;
  timestamp: Date;
}

// Excel-specific types
export interface ExcelProcessingOptions extends FileProcessingOptions {
  sheetName?: string;
  sheetIndex?: number;
  range?: string;
  evaluateFormulas?: boolean;
  dateFormat?: string;
  numberFormat?: string;
}

export interface ExcelMetadata extends FileMetadata {
  sheets: ExcelSheetInfo[];
  activeSheet: string;
  formulas: number;
  images: number;
  charts: number;
}

export interface ExcelSheetInfo {
  name: string;
  index: number;
  rowCount: number;
  columnCount: number;
  hasData: boolean;
  range?: string;
}

// CSV-specific types
export interface CSVProcessingOptions extends FileProcessingOptions {
  delimiter?: string;
  quote?: string;
  escape?: string;
  comment?: string;
  skipLinesBeginning?: number;
  skipLinesEnd?: number;
  dynamicTyping?: boolean;
  transform?: (value: string, column: string) => unknown;
}

// Performance monitoring
export interface PerformanceMetrics {
  parseTime: number;
  validationTime: number;
  transformTime: number;
  totalTime: number;
  memoryPeak: number;
  memoryAverage: number;
  gcEvents: number;
  rowsPerSecond: number;
  bytesPerSecond: number;
}

// Error recovery
export interface RecoveryOptions {
  maxErrors: number;
  skipRowsOnError: boolean;
  fallbackValues: Record<string, unknown>;
  continueOnCriticalError: boolean;
  retryAttempts: number;
}

export interface ProcessingContext {
  fileId: string;
  sessionId: string;
  userId?: string;
  metadata: FileMetadata;
  options: FileProcessingOptions;
  startTime: Date;
  endTime?: Date;
  status: ProcessingPhase;
  cancellationToken?: AbortController;
}