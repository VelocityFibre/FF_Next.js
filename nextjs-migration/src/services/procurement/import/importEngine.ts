/**
 * Excel Import Engine - Legacy Compatibility Layer
 * 
 * @deprecated This file has been split into specialized modules for better maintainability.
 * 
 * New modular structure:
 * - types.ts: Type definitions for import operations
 * - progressTracker.ts: Import progress tracking and callback management
 * - rowProcessor.ts: Individual row processing and validation
 * - columnManager.ts: Column mapping detection and management
 * - chunkProcessor.ts: Chunked processing for large files
 * - core.ts: Main import engine implementation
 * 
 * For new code, import from the modular structure:
 * ```typescript
 * import { ExcelImportEngine } from '@/services/procurement/import';
 * // or
 * import { ProgressTracker, RowProcessor } from '@/services/procurement/import';
 * ```
 * 
 * This legacy layer maintains backward compatibility while the codebase transitions.
 */

import { ExcelImportEngine as ModularExcelImportEngine } from './core';

/**
 * @deprecated Use the new modular ExcelImportEngine from '@/services/procurement/import' instead
 * 
 * Legacy import engine class that delegates to the new modular architecture
 */
export class ExcelImportEngine extends ModularExcelImportEngine {}

export default ExcelImportEngine;