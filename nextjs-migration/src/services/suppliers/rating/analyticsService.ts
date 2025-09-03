/**
 * Supplier Rating Analytics Service
 * Main orchestrator for supplier rating analytics
 */

import { Supplier, PerformancePeriod } from '@/types/supplier/base.types';
import { SupplierComparison, RatingStatistics, SupplierEvaluationReport } from './types';
import { SupplierRatingService } from './SupplierRatingService';
import { SupplierStatisticsService } from './SupplierStatisticsService';
import { SupplierEvaluationService } from './SupplierEvaluationService';
import { SupplierBenchmarkService } from './SupplierBenchmarkService';
import { SupplierTrendService } from './SupplierTrendService';
import { log } from '@/lib/logger';

export class SupplierRatingAnalyticsService {
  /**
   * Get top-rated suppliers
   */
  static async getTopRated(
    limit: number = 10,
    category?: string
  ): Promise<Supplier[]> {
    return SupplierRatingService.getTopRated(limit, category);
  }

  /**
   * Compare suppliers by ratings
   */
  static async compareSuppliers(
    supplierIds: string[]
  ): Promise<SupplierComparison[]> {
    return SupplierRatingService.compareSuppliers(supplierIds);
  }

  /**
   * Get rating statistics across all suppliers
   */
  static async getRatingStatistics(): Promise<RatingStatistics> {
    return SupplierStatisticsService.getRatingStatistics();
  }

  /**
   * Generate performance evaluation report
   */
  static async generateEvaluationReport(
    supplierId: string,
    period: PerformancePeriod
  ): Promise<SupplierEvaluationReport> {
    return SupplierEvaluationService.generateEvaluationReport(supplierId, period);
  }

  /**
   * Get supplier performance benchmarks
   */
  static async getPerformanceBenchmarks() {
    return SupplierBenchmarkService.getPerformanceBenchmarks();
  }

  /**
   * Analyze rating trends across time periods
   */
  static async analyzeRatingTrends(months: number = 12) {
    return SupplierTrendService.analyzeRatingTrends(months);
  }

  // Additional convenience methods

  /**
   * Get suppliers by rating range
   */
  static async getSuppliersByRatingRange(
    minRating: number,
    maxRating: number = 100,
    limit: number = 50
  ): Promise<Supplier[]> {
    return SupplierRatingService.getSuppliersByRatingRange(minRating, maxRating, limit);
  }

  /**
   * Get rating breakdown
   */
  static async getRatingBreakdown() {
    return SupplierStatisticsService.getRatingBreakdown();
  }

  /**
   * Get evaluation summary across multiple suppliers
   */
  static async getEvaluationSummary(
    supplierIds: string[],
    period: PerformancePeriod
  ) {
    return SupplierEvaluationService.getEvaluationSummary(supplierIds, period);
  }

  /**
   * Compare supplier against benchmarks
   */
  static async compareAgainstBenchmarks(supplierId: string) {
    return SupplierBenchmarkService.compareAgainstBenchmarks(supplierId);
  }

  /**
   * Get performance trends
   */
  static async getPerformanceTrends(months: number = 12) {
    return SupplierTrendService.getPerformanceTrends(months);
  }

  /**
   * Generate comprehensive analytics report
   */
  static async generateComprehensiveReport(supplierIds?: string[]) {
    try {
      const [ratingStats, benchmarks, trendSummary] = await Promise.all([
        this.getRatingStatistics(),
        this.getPerformanceBenchmarks(),
        SupplierTrendService.generateTrendSummaryReport()
      ]);

      return {
        ratingStatistics: ratingStats,
        performanceBenchmarks: benchmarks,
        trendAnalysis: trendSummary,
        generatedAt: new Date(),
        supplierCount: supplierIds?.length || 'all'
      };
    } catch (error) {
      log.error('Error generating comprehensive report:', { data: error }, 'analyticsService');
      throw error;
    }
  }
}