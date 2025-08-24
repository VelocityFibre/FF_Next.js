/**
 * Supplier Rating Service - Legacy Compatibility Layer
 * @deprecated Use './rating' modular components instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './rating' directly
 */

// Re-export everything from the modular structure
export * from './rating';

// Import services for legacy class compatibility
import { PerformancePeriod } from '@/types/supplier.types';
import { 
  SupplierRatingManager,
  SupplierPerformanceCalculator,
  SupplierRatingAnalyticsService,
  RatingUpdateData,
  SupplierComparison,
  RatingStatistics,
  SupplierEvaluationReport
} from './rating';

/**
 * Supplier rating and performance service
 * @deprecated Use individual services from './rating' instead
 */
export class SupplierRatingService {
  /**
   * Update supplier rating with automatic overall calculation
   * @deprecated Use SupplierRatingManager.updateRating() instead
   */
  static async updateRating(
    id: string, 
    rating: RatingUpdateData,
    reviewerId?: string
  ): Promise<void> {
    return SupplierRatingManager.updateRating(id, rating, reviewerId);
  }

  /**
   * Calculate comprehensive supplier performance metrics
   * @deprecated Use SupplierPerformanceCalculator.calculatePerformance() instead
   */
  static async calculatePerformance(
    supplierId: string, 
    period: PerformancePeriod
  ) {
    return SupplierPerformanceCalculator.calculatePerformance(supplierId, period);
  }

  /**
   * Get performance trends over time
   * @deprecated Use SupplierPerformanceCalculator.getPerformanceTrends() instead
   */
  static async getPerformanceTrends(
    supplierId: string,
    months: number = 12
  ) {
    return SupplierPerformanceCalculator.getPerformanceTrends(supplierId, months);
  }

  /**
   * Get top-rated suppliers
   * @deprecated Use SupplierRatingAnalyticsService.getTopRated() instead
   */
  static async getTopRated(
    limit: number = 10,
    category?: string
  ) {
    return SupplierRatingAnalyticsService.getTopRated(limit, category);
  }

  /**
   * Compare suppliers by ratings
   * @deprecated Use SupplierRatingAnalyticsService.compareSuppliers() instead
   */
  static async compareSuppliers(
    supplierIds: string[]
  ): Promise<SupplierComparison[]> {
    return SupplierRatingAnalyticsService.compareSuppliers(supplierIds);
  }

  /**
   * Get rating statistics across all suppliers
   * @deprecated Use SupplierRatingAnalyticsService.getRatingStatistics() instead
   */
  static async getRatingStatistics(): Promise<RatingStatistics> {
    return SupplierRatingAnalyticsService.getRatingStatistics();
  }

  /**
   * Generate performance evaluation report
   * @deprecated Use SupplierRatingAnalyticsService.generateEvaluationReport() instead
   */
  static async generateEvaluationReport(
    supplierId: string,
    period: PerformancePeriod
  ): Promise<SupplierEvaluationReport> {
    return SupplierRatingAnalyticsService.generateEvaluationReport(supplierId, period);
  }

  /**
   * Normalize rating data to handle legacy formats
   * @deprecated Use SupplierRatingManager.normalizeRating() instead
   */
  private static normalizeRating(rating: any) {
    return SupplierRatingManager.normalizeRating(rating);
  }

  /**
   * Calculate overall rating from individual components
   * @deprecated Use SupplierRatingManager.calculateOverallRating() instead
   */
  private static calculateOverallRating(rating: any): number {
    return SupplierRatingManager.calculateOverallRating(rating);
  }

  /**
   * Generate mock performance metrics
   * @deprecated Use SupplierPerformanceCalculator.generatePerformanceMetrics() instead
   */
  private static async generatePerformanceMetrics(
    supplierId: string,
    period: PerformancePeriod
  ) {
    return SupplierPerformanceCalculator.generatePerformanceMetrics(supplierId, period);
  }
}

// Default export for backward compatibility
export { SupplierRatingManager as default } from './rating';