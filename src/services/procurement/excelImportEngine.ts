/**
 * Excel Import Engine - Legacy Compatibility Layer
 * 
 * This file maintains backward compatibility while delegating to the new modular structure.
 * Previous file size: 715+ lines
 * Current file size: <50 lines
 * 
 * New modular structure:
 * - import/importTypes.ts: Types and interfaces
 * - import/importEngine.ts: Main processing engine
 * - import/fileParsing.ts: File reading and parsing logic
 * - import/columnMapping.ts: Column mapping and detection
 * - import/importValidation.ts: Validation and consistency checks
 * - import/index.ts: Centralized exports
 */

// Re-export everything from the new modular structure
export * from './import';

// Maintain legacy exports for backward compatibility
export { 
  ExcelImportEngine,
  createImportEngine,
  quickImport
} from './import';

// Legacy type aliases (if any were used differently)
export type { 
  ImportProgress,
  ImportError,
  ImportWarning,
  ParsedBOQItem,
  ImportResult,
  ColumnMapping,
  FileInfo,
  ProgressCallback
} from './import';