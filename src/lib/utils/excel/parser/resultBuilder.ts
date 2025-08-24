/**
 * Excel Parser - Result Builder
 * Handles output formatting and metadata generation
 */

import { 
  ParseResult,
  ParsedBOQItem,
  ParseError,
  ParseWarning,
  ProcessingStats,
  ParseMetadata
} from './types';

export class ResultBuilder {
  /**
   * Build complete parse result
   */
  static buildResult(
    items: ParsedBOQItem[],
    errors: ParseError[],
    warnings: ParseWarning[],
    file: File,
    startTime: number,
    stats?: ProcessingStats
  ): ParseResult {
    const metadata = this.buildMetadata(file, startTime, errors, stats, items);
    
    return {
      success: errors.length === 0,
      items,
      errors,
      warnings,
      metadata
    };
  }

  /**
   * Build result with error only
   */
  static buildErrorResult(
    error: string,
    file: File,
    startTime: number
  ): ParseResult {
    const errorObj: ParseError = {
      row: 0,
      column: '',
      value: null,
      message: error,
      type: 'parsing'
    };

    const metadata = this.buildMetadata(file, startTime, [errorObj], undefined, []);
    
    return {
      success: false,
      items: [],
      errors: [errorObj],
      warnings: [],
      metadata
    };
  }

  /**
   * Build metadata for the parse result
   */
  private static buildMetadata(
    file: File,
    startTime: number,
    errors: ParseError[],
    stats?: ProcessingStats,
    items?: ParsedBOQItem[]
  ): ParseMetadata {
    const processingTime = Date.now() - startTime;
    const fileType = this.detectFileType(file.name);
    
    return {
      totalRows: stats?.totalRows || items?.length || 0,
      processedRows: stats?.processedRows || items?.length || 0,
      skippedRows: stats?.skippedRows || 0,
      invalidRows: errors.filter(e => e.type === 'validation').length,
      processingTime,
      fileType
    };
  }

  /**
   * Detect file type from filename
   */
  private static detectFileType(fileName: string): 'xlsx' | 'csv' {
    return fileName.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx';
  }

  /**
   * Create summary statistics
   */
  static createSummaryStats(result: ParseResult): {
    successRate: number;
    errorRate: number;
    warningRate: number;
    processingSpeed: number; // rows per second
  } {
    const totalRows = result.metadata.totalRows;
    const processingTimeSeconds = result.metadata.processingTime / 1000;
    
    return {
      successRate: totalRows > 0 ? (result.metadata.processedRows / totalRows) * 100 : 0,
      errorRate: totalRows > 0 ? (result.metadata.invalidRows / totalRows) * 100 : 0,
      warningRate: totalRows > 0 ? (result.warnings.length / totalRows) * 100 : 0,
      processingSpeed: processingTimeSeconds > 0 ? totalRows / processingTimeSeconds : 0
    };
  }

  /**
   * Group errors by type
   */
  static groupErrorsByType(errors: ParseError[]): Record<string, ParseError[]> {
    return errors.reduce((groups, error) => {
      const type = error.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(error);
      return groups;
    }, {} as Record<string, ParseError[]>);
  }

  /**
   * Get most common errors
   */
  static getMostCommonErrors(errors: ParseError[], limit: number = 5): Array<{
    message: string;
    count: number;
    percentage: number;
  }> {
    const errorCounts = errors.reduce((counts, error) => {
      counts[error.message] = (counts[error.message] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const sortedErrors = Object.entries(errorCounts)
      .map(([message, count]) => ({
        message,
        count,
        percentage: (count / errors.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedErrors;
  }

  /**
   * Generate processing report
   */
  static generateProcessingReport(result: ParseResult): string {
    const stats = this.createSummaryStats(result);
    const errorsByType = this.groupErrorsByType(result.errors);
    const commonErrors = this.getMostCommonErrors(result.errors, 3);

    let report = `Parsing Report\n`;
    report += `================\n\n`;
    report += `Total Rows: ${result.metadata.totalRows}\n`;
    report += `Processed: ${result.metadata.processedRows} (${stats.successRate.toFixed(1)}%)\n`;
    report += `Skipped: ${result.metadata.skippedRows}\n`;
    report += `Invalid: ${result.metadata.invalidRows} (${stats.errorRate.toFixed(1)}%)\n`;
    report += `Warnings: ${result.warnings.length} (${stats.warningRate.toFixed(1)}%)\n`;
    report += `Processing Time: ${result.metadata.processingTime}ms\n`;
    report += `Speed: ${stats.processingSpeed.toFixed(1)} rows/second\n\n`;

    if (result.errors.length > 0) {
      report += `Errors by Type:\n`;
      Object.entries(errorsByType).forEach(([type, errors]) => {
        report += `  ${type}: ${errors.length}\n`;
      });
      report += `\n`;

      report += `Most Common Errors:\n`;
      commonErrors.forEach((error, index) => {
        report += `  ${index + 1}. ${error.message} (${error.count} times, ${error.percentage.toFixed(1)}%)\n`;
      });
    }

    return report;
  }
}