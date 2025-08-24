/**
 * Excel Parser - Main Parser Class
 * Orchestrates the complete parsing process
 */

import { ParseConfig, ParseResult, ProgressCallback } from './types';
import { ExcelFileHandler, CSVFileHandler, FileTypeDetector } from './fileHandlers';
import { DataProcessor } from './dataProcessor';
import { ResultBuilder } from './resultBuilder';

export class ExcelParser {
  private config: ParseConfig;
  private dataProcessor: DataProcessor;

  constructor(config: ParseConfig = {}) {
    this.config = {
      headerRow: 0,
      skipRows: 0,
      strictValidation: false,
      locale: 'en-US',
      validateFormulas: false,
      ...config
    };
    this.dataProcessor = new DataProcessor(this.config);
  }

  /**
   * Parse Excel (.xlsx) file
   */
  async parseExcel(file: File, onProgress?: ProgressCallback): Promise<ParseResult> {
    const startTime = Date.now();

    // Validate file first
    const validation = FileTypeDetector.validateFile(file);
    if (!validation.valid) {
      return ResultBuilder.buildErrorResult(validation.error!, file, startTime);
    }

    try {
      // Parse Excel to raw data
      const { data, error } = await ExcelFileHandler.parseExcelToRaw(file, onProgress);
      
      if (error) {
        return ResultBuilder.buildErrorResult(error, file, startTime);
      }

      // Process raw data
      const processingResult = this.dataProcessor.processRawData(data, onProgress);
      
      // Build final result
      return ResultBuilder.buildResult(
        processingResult.items,
        processingResult.errors,
        processingResult.warnings,
        file,
        startTime,
        processingResult.stats
      );
    } catch (error) {
      const errorMessage = `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return ResultBuilder.buildErrorResult(errorMessage, file, startTime);
    }
  }

  /**
   * Parse CSV file
   */
  async parseCSV(file: File, onProgress?: ProgressCallback): Promise<ParseResult> {
    const startTime = Date.now();

    // Validate file first
    const validation = FileTypeDetector.validateFile(file);
    if (!validation.valid) {
      return ResultBuilder.buildErrorResult(validation.error!, file, startTime);
    }

    try {
      // Parse CSV to raw data
      const { data, error } = await CSVFileHandler.parseCSVToRaw(file, onProgress);
      
      if (error) {
        return ResultBuilder.buildErrorResult(error, file, startTime);
      }

      // Process raw data
      const processingResult = this.dataProcessor.processRawData(data, onProgress);
      
      // Build final result
      return ResultBuilder.buildResult(
        processingResult.items,
        processingResult.errors,
        processingResult.warnings,
        file,
        startTime,
        processingResult.stats
      );
    } catch (error) {
      const errorMessage = `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return ResultBuilder.buildErrorResult(errorMessage, file, startTime);
    }
  }

  /**
   * Parse file (auto-detect format)
   */
  async parseFile(file: File, onProgress?: ProgressCallback): Promise<ParseResult> {
    const fileType = FileTypeDetector.detectFileType(file);
    
    switch (fileType) {
      case 'xlsx':
        return this.parseExcel(file, onProgress);
      case 'csv':
        return this.parseCSV(file, onProgress);
      default:
        const startTime = Date.now();
        return ResultBuilder.buildErrorResult(
          'Unsupported file format. Please use .xlsx or .csv files',
          file,
          startTime
        );
    }
  }

  /**
   * Update parser configuration
   */
  updateConfig(newConfig: Partial<ParseConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.dataProcessor = new DataProcessor(this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): ParseConfig {
    return { ...this.config };
  }
}