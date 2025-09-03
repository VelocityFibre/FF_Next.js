/**
 * Compliance Report Builder - Main Interface
 * Provides backward compatibility while delegating to modular components
 */

import { ComplianceReport, ComplianceSummaryReport } from './report-types';
import { ReportGenerator } from './report-generator';
import { ReportAggregator } from './report-aggregator';

/**
 * Main compliance report builder class
 * Delegates to specialized modules for better maintainability
 */
export class ComplianceReportBuilder {
  /**
   * Generate comprehensive compliance report for a single supplier
   */
  static async generateComplianceReport(supplierId: string): Promise<ComplianceReport> {
    return ReportGenerator.generateComplianceReport(supplierId);
  }

  /**
   * Generate summary report for multiple suppliers
   */
  static async generateSummaryReport(supplierIds: string[]): Promise<ComplianceSummaryReport> {
    return ReportAggregator.generateSummaryReport(supplierIds);
  }
}

// Re-export modular components for direct access
export { ReportGenerator } from './report-generator';
export { ComplianceCalculator } from './compliance-calculator';
export { RecommendationEngine } from './recommendation-engine';
export { ReportAggregator } from './report-aggregator';