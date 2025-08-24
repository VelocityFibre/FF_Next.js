/**
 * Supplier Benchmark Service - Backward Compatibility Layer
 * @deprecated Use ./benchmark/ modules for improved modular benchmark system
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular benchmark system in ./benchmark/
 */

// Re-export everything from the new modular structure
export * from './benchmark';

// Import classes for backward compatibility
import { BenchmarkCalculator } from './benchmark/benchmark-calculator';
import { ComparisonEngine } from './benchmark/comparison-engine';
import { BenchmarkReports } from './benchmark/benchmark-reports';
import { SupplierCrudService } from '../supplier.crud';

/**
 * Legacy SupplierBenchmarkService class for backward compatibility
 */
export class SupplierBenchmarkService {
  /**
   * Get supplier performance benchmarks
   * @deprecated Use BenchmarkCalculator.calculateBenchmarks instead
   */
  static async getPerformanceBenchmarks(): Promise<{
    industryAverages: {
      overallScore: number;
      deliveryScore: number;
      qualityScore: number;
      priceScore: number;
      serviceScore: number;
    };
    topPerformers: {
      overallScore: number;
      deliveryScore: number;
      qualityScore: number;
      priceScore: number;
      serviceScore: number;
    };
    categoryBenchmarks: Record<string, {
      overallScore: number;
      sampleSize: number;
    }>;
  }> {
    return BenchmarkCalculator.calculateBenchmarks();
  }

  /**
   * Compare supplier against benchmarks
   * @deprecated Use ComparisonEngine.compareSupplier instead
   */
  static async compareAgainstBenchmarks(supplierId: string): Promise<{
    supplierScores: {
      overallScore: number;
      deliveryScore: number;
      qualityScore: number;
      priceScore: number;
      serviceScore: number;
    };
    industryComparison: {
      overallDiff: number;
      deliveryDiff: number;
      qualityDiff: number;
      priceDiff: number;
      serviceDiff: number;
    };
    topPerformersComparison: {
      overallDiff: number;
      deliveryDiff: number;
      qualityDiff: number;
      priceDiff: number;
      serviceDiff: number;
    };
    categoryRanking?: {
      category: string;
      rank: number;
      totalInCategory: number;
      percentile: number;
    }[];
  }> {
    return ComparisonEngine.compareSupplier(supplierId);
  }

  /**
   * Get category rankings for a supplier
   * @deprecated Use ComparisonEngine.getCategoryRankings instead
   */
  static async getCategoryRankings(
    supplierId: string, 
    categories: string[]
  ): Promise<Array<{
    category: string;
    rank: number;
    totalInCategory: number;
    percentile: number;
  }>> {
    return ComparisonEngine.getCategoryRankings(supplierId, categories);
  }

  /**
   * Get all suppliers in a specific category
   * @deprecated This method is now private in ComparisonEngine
   */
  private static async getSuppliersInCategory(category: string) {
    const allSuppliers = await SupplierCrudService.getAll();
    return allSuppliers.filter(supplier => 
      supplier.status === 'active' && 
      supplier.categories?.includes(category) &&
      supplier.performance
    );
  }

  /**
   * Get benchmark trends over time
   * @deprecated Use BenchmarkReports.getBenchmarkTrends instead
   */
  static async getBenchmarkTrends(months: number = 12): Promise<Array<{
    period: string;
    industryAverage: number;
    topPerformerAverage: number;
    categoryAverages: Record<string, number>;
  }>> {
    return BenchmarkReports.getBenchmarkTrends({ months });
  }
}