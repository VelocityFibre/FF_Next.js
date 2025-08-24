/**
 * Benchmark Calculator
 * Handles percentile calculations and benchmarking against peers
 */

import { Supplier } from '@/types/supplier.types';
import { 
  SupplierBenchmarks,
  PercentileCalculation,
  PEER_COMPARISON_THRESHOLDS
} from '../scorecardTypes';
import { ScorecardCalculator } from '../scorecardCalculator';

export class BenchmarkCalculator {
  /**
   * Calculate benchmarks against industry and category peers
   */
  static async calculateBenchmarks(supplier: Supplier): Promise<SupplierBenchmarks> {
    try {
      // Get all suppliers for comparison
      const supplierCrudService = await import('../../supplier.crud');
      const allSuppliers = await supplierCrudService.SupplierCrudService.getAll();
      
      const supplierScore = ScorecardCalculator.calculateOverallScore(supplier);
      
      // Calculate industry percentile (all suppliers)
      const industryPercentile = this.calculateIndustryPercentile(supplierScore, allSuppliers);
      
      // Calculate category percentile
      const categoryPercentile = this.calculateCategoryPercentile(supplier, supplierScore, allSuppliers);
      
      // Determine peer comparison
      const peerComparison = this.determinePeerComparison(industryPercentile);
      
      return {
        industryPercentile: Math.round(industryPercentile),
        categoryPercentile: Math.round(categoryPercentile),
        peerComparison
      };
    } catch (error) {
      console.error('Error calculating benchmarks:', error);
      return {
        industryPercentile: 50,
        categoryPercentile: 50,
        peerComparison: 'at'
      };
    }
  }

  /**
   * Calculate industry percentile ranking
   */
  private static calculateIndustryPercentile(
    supplierScore: number, 
    allSuppliers: Supplier[]
  ): number {
    const allScores = allSuppliers
      .map(s => ScorecardCalculator.calculateOverallScore(s))
      .filter(score => score > 0)
      .sort((a, b) => a - b);
    
    return this.calculatePercentile(supplierScore, allScores);
  }

  /**
   * Calculate category-specific percentile ranking
   */
  private static calculateCategoryPercentile(
    supplier: Supplier,
    supplierScore: number,
    allSuppliers: Supplier[]
  ): number {
    if (!supplier.categories || supplier.categories.length === 0) {
      return 50; // Default if no categories
    }

    const categorySuppliers = allSuppliers.filter(s => 
      s.categories?.some(cat => supplier.categories!.includes(cat))
    );
    
    const categoryScores = categorySuppliers
      .map(s => ScorecardCalculator.calculateOverallScore(s))
      .filter(score => score > 0)
      .sort((a, b) => a - b);
    
    return this.calculatePercentile(supplierScore, categoryScores);
  }

  /**
   * Calculate percentile ranking for a value in a sorted array
   */
  static calculatePercentile(value: number, sortedArray: number[]): number {
    if (sortedArray.length === 0) return 50;
    
    const index = sortedArray.findIndex(v => v >= value);
    if (index === -1) return 100; // Higher than all values
    
    return (index / sortedArray.length) * 100;
  }

  /**
   * Get detailed percentile calculation information
   */
  static calculateDetailedPercentile(
    value: number, 
    sortedArray: number[]
  ): PercentileCalculation {
    const percentile = this.calculatePercentile(value, sortedArray);
    const ranking = sortedArray.findIndex(v => v >= value) + 1;
    
    return {
      value,
      ranking,
      totalCount: sortedArray.length,
      percentile
    };
  }

  /**
   * Determine peer comparison status
   */
  private static determinePeerComparison(industryPercentile: number): 'above' | 'at' | 'below' {
    if (industryPercentile >= PEER_COMPARISON_THRESHOLDS.above) {
      return 'above';
    } else if (industryPercentile <= PEER_COMPARISON_THRESHOLDS.below) {
      return 'below';
    } else {
      return 'at';
    }
  }

  /**
   * Get percentile range description
   */
  static getPercentileRange(percentile: number): string {
    if (percentile >= 90) return 'Top 10%';
    if (percentile >= 75) return 'Top 25%';
    if (percentile >= 50) return 'Top 50%';
    if (percentile >= 25) return 'Bottom 50%';
    return 'Bottom 25%';
  }
}