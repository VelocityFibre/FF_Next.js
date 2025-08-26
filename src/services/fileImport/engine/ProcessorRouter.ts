/**
 * Processor Router
 * Routes files to appropriate processors based on file type and processing strategy
 */

import type { FileType, ProcessorConfig } from '../types';
import { EnhancedCSVProcessor } from '../processors/EnhancedCSVProcessor';
import { EnhancedExcelProcessor } from '../processors/EnhancedExcelProcessor';

export class ProcessorRouter {
  private csvProcessor: EnhancedCSVProcessor;
  private excelProcessor: EnhancedExcelProcessor;

  constructor() {
    this.csvProcessor = new EnhancedCSVProcessor();
    this.excelProcessor = new EnhancedExcelProcessor();
  }

  /**
   * Get processor for file type
   */
  public getProcessor(fileType: FileType): EnhancedCSVProcessor | EnhancedExcelProcessor {
    switch (fileType) {
      case 'csv':
        return this.csvProcessor;
      case 'xlsx':
      case 'xls':
        return this.excelProcessor;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Get streaming processor for file type
   */
  public getStreamingProcessor(fileType: FileType): EnhancedCSVProcessor | EnhancedExcelProcessor {
    // For now, both processors handle streaming internally
    return this.getProcessor(fileType);
  }

  /**
   * Determine if file type supports streaming
   */
  public supportsStreaming(fileType: FileType): boolean {
    switch (fileType) {
      case 'csv':
        return true;
      case 'xlsx':
      case 'xls':
        return true; // ExcelJS supports streaming
      default:
        return false;
    }
  }

  /**
   * Get recommended strategy for file
   */
  public getRecommendedStrategy(
    file: File,
    fileType: FileType,
    _config: ProcessorConfig
  ): 'direct' | 'worker' | 'streaming' {
    const fileSizeInMB = file.size / (1024 * 1024);

    // CSV files can handle larger sizes efficiently
    if (fileType === 'csv') {
      if (fileSizeInMB > 50) return 'streaming';
      if (fileSizeInMB > 10) return 'worker';
      return 'direct';
    }

    // Excel files are more memory intensive
    if (fileType === 'xlsx' || fileType === 'xls') {
      if (fileSizeInMB > 25) return 'streaming';
      if (fileSizeInMB > 5) return 'worker';
      return 'direct';
    }

    return 'direct';
  }
}