/**
 * Import Engine - Module Exports
 * Modular Excel Import Engine for BOQ files
 */

// Main engine class
export { ExcelImportEngine } from './importEngine';

// Core components
export { ProgressManager } from './progressManager';
export { FileProcessor } from './fileProcessor';
export { DataProcessor } from './dataProcessor';

// Types
export type {
  EngineConfig,
  ProcessingOptions,
  ProcessingContext,
  ChunkProcessingResult,
  ImportProgress,
  ImportResult,
  ProgressCallback,
  ColumnMapping,
  ParsedBOQItem,
  ImportError,
  ImportWarning
} from './types';

// Legacy compatibility - maintain backward compatibility
export { ExcelImportEngine as default } from './importEngine';