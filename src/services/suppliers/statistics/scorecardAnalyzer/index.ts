/**
 * Scorecard Analyzer - Main Export
 * Re-exports all analyzer components for backward compatibility
 */

import { Supplier } from '@/types/supplier/base.types';
import { SupplierTrends, SupplierBenchmarks } from '../scorecardTypes';
import { TrendsCalculator } from './trendsCalculator';
import { BenchmarkCalculator } from './benchmarkCalculator';
import { CompetitiveAnalyzer } from './competitiveAnalyzer';

/**
 * Main ScorecardAnalyzer class - maintains backward compatibility
 */
export class ScorecardAnalyzer {
  /**
   * Calculate performance trends over different periods
   */
  static async calculateTrends(supplier: Supplier): Promise<SupplierTrends> {
    return TrendsCalculator.calculateTrends(supplier);
  }

  /**
   * Calculate benchmarks against industry and category peers
   */
  static async calculateBenchmarks(supplier: Supplier): Promise<SupplierBenchmarks> {
    return BenchmarkCalculator.calculateBenchmarks(supplier);
  }

  /**
   * Calculate percentile ranking for a value in a sorted array
   */
  static calculatePercentile(value: number, sortedArray: number[]): number {
    return BenchmarkCalculator.calculatePercentile(value, sortedArray);
  }

  /**
   * Get detailed percentile calculation information
   */
  static calculateDetailedPercentile(value: number, sortedArray: number[]) {
    return BenchmarkCalculator.calculateDetailedPercentile(value, sortedArray);
  }

  /**
   * Calculate competitive position analysis
   */
  static calculateCompetitivePosition(supplier: Supplier, allSuppliers: Supplier[]) {
    return CompetitiveAnalyzer.calculateCompetitivePosition(supplier, allSuppliers);
  }

  /**
   * Calculate market position insights
   */
  static calculateMarketPositionInsights(supplier: Supplier, allSuppliers: Supplier[]) {
    return CompetitiveAnalyzer.calculateMarketPositionInsights(supplier, allSuppliers);
  }

  /**
   * Calculate trend momentum
   */
  static calculateTrendMomentum(trends: SupplierTrends) {
    return TrendsCalculator.calculateTrendMomentum(trends);
  }
}

// Export individual components for direct access
export { TrendsCalculator } from './trendsCalculator';
export { BenchmarkCalculator } from './benchmarkCalculator';
export { CompetitiveAnalyzer } from './competitiveAnalyzer';