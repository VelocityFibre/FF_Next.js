/**
 * Supplier Trend Service - Legacy Compatibility Layer
 * @deprecated Use modular components from './supplier-trend' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './supplier-trend' directly
 */

import {
  SupplierRatingAnalyzer,
  SupplierPerformanceTracker,
  SupplierTrendReporter,
  type RatingTrend,
  type PerformanceTrend,
  type GrowthTrend,
  type CategoryTrend,
  type ReviewVolumeTrend,
  type TrendSummaryReport
} from './supplier-trend';

export class SupplierTrendService {
  /**
   * Analyze rating trends across time periods
   * @deprecated Use SupplierRatingAnalyzer.analyzeRatingTrends instead
   */
  static async analyzeRatingTrends(months: number = 12): Promise<RatingTrend[]> {
    return SupplierRatingAnalyzer.analyzeRatingTrends(months);
  }

  /**
   * Get performance trends for specific metrics
   * @deprecated Use SupplierPerformanceTracker.getPerformanceTrends instead
   */
  static async getPerformanceTrends(months: number = 12): Promise<PerformanceTrend[]> {
    return SupplierPerformanceTracker.getPerformanceTrends(months);
  }

  /**
   * Get supplier growth trends
   * @deprecated Use SupplierPerformanceTracker.getSupplierGrowthTrends instead
   */
  static async getSupplierGrowthTrends(months: number = 12): Promise<GrowthTrend[]> {
    return SupplierPerformanceTracker.getSupplierGrowthTrends(months);
  }

  /**
   * Get category performance trends
   * @deprecated Use SupplierTrendReporter.getCategoryTrends instead
   */
  static async getCategoryTrends(
    categories: string[],
    months: number = 12
  ): Promise<Record<string, CategoryTrend[]>> {
    return SupplierTrendReporter.getCategoryTrends(categories, months);
  }

  /**
   * Get review volume trends
   * @deprecated Use SupplierPerformanceTracker.getReviewVolumeTrends instead
   */
  static async getReviewVolumeTrends(months: number = 12): Promise<ReviewVolumeTrend[]> {
    return SupplierPerformanceTracker.getReviewVolumeTrends(months);
  }

  /**
   * Generate trend summary report
   * @deprecated Use SupplierTrendReporter.generateTrendSummaryReport instead
   */
  static async generateTrendSummaryReport(months: number = 6): Promise<TrendSummaryReport> {
    return SupplierTrendReporter.generateTrendSummaryReport(months);
  }
}

// Re-export modular components for easier migration
export {
  SupplierRatingAnalyzer,
  SupplierPerformanceTracker,
  SupplierTrendReporter
} from './supplier-trend';