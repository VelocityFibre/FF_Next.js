/**
 * Supplier Statistics Service - Legacy Compatibility Layer
 * @deprecated Use './statistics' modular components instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './statistics' directly
 */

// Re-export everything from the modular structure
export * from './statistics';

// Import services for legacy class compatibility
import { 
  BasicStatsCalculator,
  CategoryAnalyticsService,
  PerformanceAnalyzer,
  LocationAnalyzer,
  ScorecardGenerator,
  SupplierStatistics,
  CategoryAnalytics,
  PerformanceTrends,
  LocationDistribution,
  PerformanceBenchmarks,
  SupplierScorecard
} from './statistics';

/**
 * Supplier statistics service
 * @deprecated Use individual services from './statistics' instead
 */
export class SupplierStatisticsService {
  /**
   * Get comprehensive supplier statistics
   * @deprecated Use BasicStatsCalculator.getStatistics() instead
   */
  static async getStatistics(): Promise<SupplierStatistics> {
    return BasicStatsCalculator.getStatistics();
  }

  /**
   * Get category-based analytics
   * @deprecated Use CategoryAnalyticsService.getCategoryAnalytics() instead
   */
  static async getCategoryAnalytics(): Promise<CategoryAnalytics[]> {
    return CategoryAnalyticsService.getCategoryAnalytics();
  }

  /**
   * Get performance trends over time
   * @deprecated Use PerformanceAnalyzer.getPerformanceTrends() instead
   */
  static async getPerformanceTrends(months: number = 12): Promise<PerformanceTrends[]> {
    return PerformanceAnalyzer.getPerformanceTrends(months);
  }

  /**
   * Get location distribution
   * @deprecated Use LocationAnalyzer.getLocationDistribution() instead
   */
  static async getLocationDistribution(): Promise<LocationDistribution[]> {
    return LocationAnalyzer.getLocationDistribution();
  }

  /**
   * Get performance benchmarks
   * @deprecated Use PerformanceAnalyzer.getPerformanceBenchmarks() instead
   */
  static async getPerformanceBenchmarks(): Promise<PerformanceBenchmarks> {
    return PerformanceAnalyzer.getPerformanceBenchmarks();
  }

  /**
   * Generate supplier scorecard
   * @deprecated Use ScorecardGenerator.generateSupplierScorecard() instead
   */
  static async generateSupplierScorecard(supplierId: string): Promise<SupplierScorecard> {
    return ScorecardGenerator.generateSupplierScorecard(supplierId);
  }
}

// Default export for backward compatibility
export { BasicStatsCalculator as default } from './statistics';