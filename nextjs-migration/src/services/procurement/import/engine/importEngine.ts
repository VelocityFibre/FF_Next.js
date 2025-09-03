/**
 * Import Engine - Main Engine Class
 * Orchestrates the complete import process with progress tracking
 */

import { 
  EngineConfig, 
  ProcessingOptions, 
  ImportResult, 
  ColumnMapping, 
  ProgressCallback 
} from './types';
import { DEFAULT_COLUMN_MAPPING } from '../importTypes';
import { ProgressManager } from './progressManager';
import { FileProcessor } from './fileProcessor';

/**
 * Main Excel Import Engine for BOQ files
 * Supports streaming processing for large files with progress tracking
 */
export class ExcelImportEngine {
  private progressManager: ProgressManager;
  private fileProcessor: FileProcessor;
  private columnMapping: ColumnMapping;

  constructor(config: EngineConfig = {}) {
    this.progressManager = new ProgressManager(config.progressCallback);
    this.fileProcessor = new FileProcessor(this.progressManager);
    this.columnMapping = { 
      ...DEFAULT_COLUMN_MAPPING, 
      ...config.customColumnMapping 
    } as ColumnMapping;
  }

  /**
   * Parse Excel or CSV file and return structured BOQ data
   */
  async parseFile(file: File, options: ProcessingOptions = {}): Promise<ImportResult> {
    return this.fileProcessor.processFileStandard(file, this.columnMapping, options);
  }

  /**
   * Process file in chunks for better memory management
   */
  async parseFileInChunks(
    file: File, 
    chunkSize: number = 1000, 
    options: ProcessingOptions = {}
  ): Promise<ImportResult> {
    return this.fileProcessor.processFileChunked(file, this.columnMapping, chunkSize, options);
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
   * Update progress callback
   */
  setProgressCallback(callback: ProgressCallback): void {
    this.progressManager.setCallback(callback);
  }
}