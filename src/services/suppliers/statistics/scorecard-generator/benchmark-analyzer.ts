/**
 * Benchmark Analyzer
 * Trend analysis and benchmarking calculations
 */

import { Supplier } from '@/types/supplier/base.types';
import { ScorecardScoreCalculator } from './score-calculator';
import type { TrendData, BenchmarkData } from './scorecard-types';

export class ScorecardBenchmarkAnalyzer {
  /**
   * Calculate performance trends
   */
  static async calculateTrends(supplier: Supplier): Promise<TrendData> {
    // This would ideally use historical data
    // For now, we'll use simplified trend calculation based on current metrics
    const currentScore = ScorecardScoreCalculator.calculateOverallScore(supplier);
    
    // Simulate trend data - in real implementation, this would query historical records
    const trendVariation = Math.random() * 10 - 5; // ±5 point variation
    
    return {
      last3Months: Math.max(0, Math.min(100, currentScore + (trendVariation * 0.5))),
      last6Months: Math.max(0, Math.min(100, currentScore + trendVariation)),
      last12Months: Math.max(0, Math.min(100, currentScore + (trendVariation * 1.5)))
    };
  }

  /**
   * Calculate benchmarks against industry/category
   */
  static async calculateBenchmarks(supplier: Supplier): Promise<BenchmarkData> {
    try {
      // Get all suppliers for comparison
      const supplierCrudService = await import('../../supplier.crud');
      const allSuppliers = await supplierCrudService.SupplierCrudService.getAll();
      
      const supplierScore = ScorecardScoreCalculator.calculateOverallScore(supplier);

      // Industry percentile (all suppliers)
      const allScores = allSuppliers
        .map(s => ScorecardScoreCalculator.calculateOverallScore(s))
        .filter(score => score > 0)
        .sort((a, b) => a - b);
      
      const industryPercentile = ScorecardScoreCalculator.calculatePercentile(supplierScore, allScores);

      // Category percentile
      let categoryPercentile = 50; // Default
      if (supplier.categories && supplier.categories.length > 0) {
        const categorySuppliers = allSuppliers.filter(s => 
          s.categories?.some(cat => supplier.categories!.includes(cat))
        );
        
        const categoryScores = categorySuppliers
          .map(s => ScorecardScoreCalculator.calculateOverallScore(s))
          .filter(score => score > 0)
          .sort((a, b) => a - b);
        
        categoryPercentile = ScorecardScoreCalculator.calculatePercentile(supplierScore, categoryScores);
      }

      // Peer comparison
      let peerComparison: 'above' | 'below' | 'at';
      if (industryPercentile >= 75) {
        peerComparison = 'above';
      } else if (industryPercentile <= 25) {
        peerComparison = 'below';
      } else {
        peerComparison = 'at';
      }

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
   * Calculate historical performance comparison
   */
  static calculateHistoricalComparison(currentScore: number, trends: TrendData): {
    trend: 'improving' | 'stable' | 'declining';
    changePercent: number;
    description: string;
  } {
    const threeMonthChange = currentScore - trends.last3Months;
    const sixMonthChange = currentScore - trends.last6Months;
    
    let trend: 'improving' | 'stable' | 'declining';
    let changePercent: number;
    
    if (Math.abs(threeMonthChange) < 2) {
      trend = 'stable';
      changePercent = 0;
    } else if (threeMonthChange > 0) {
      trend = 'improving';
      changePercent = Math.abs(threeMonthChange);
    } else {
      trend = 'declining';
      changePercent = Math.abs(threeMonthChange);
    }

    const description = this.generateTrendDescription(trend, changePercent, sixMonthChange);

    return {
      trend,
      changePercent: Math.round(changePercent * 10) / 10,
      description
    };
  }

  /**
   * Generate trend description
   */
  private static generateTrendDescription(
    trend: 'improving' | 'stable' | 'declining', 
    changePercent: number, 
    sixMonthChange: number
  ): string {
    switch (trend) {
      case 'improving':
        return `Performance has improved by ${changePercent.toFixed(1)}% over the last 3 months`;
      case 'declining':
        return `Performance has declined by ${changePercent.toFixed(1)}% over the last 3 months`;
      case 'stable': {
        const sixMonthTrend = sixMonthChange > 2 ? 'with overall improvement' : 
                             sixMonthChange < -2 ? 'following previous decline' : 'consistently';
        return `Performance has remained stable ${sixMonthTrend}`;
      }
      default:
        return 'Performance trend data unavailable';
    }
  }

  /**
   * Calculate competitive positioning
   */
  static calculateCompetitivePosition(benchmarks: BenchmarkData): {
    position: 'leader' | 'competitive' | 'follower';
    description: string;
  } {
    const { industryPercentile, peerComparison } = benchmarks;
    void peerComparison; // Variable extracted but not used in this function

    let position: 'leader' | 'competitive' | 'follower';
    let description: string;

    if (industryPercentile >= 90) {
      position = 'leader';
      description = 'Top-tier supplier with exceptional performance';
    } else if (industryPercentile >= 75) {
      position = 'leader';
      description = 'High-performing supplier above industry average';
    } else if (industryPercentile >= 50) {
      position = 'competitive';
      description = 'Solid performer meeting industry standards';
    } else if (industryPercentile >= 25) {
      position = 'competitive';
      description = 'Below average but within acceptable range';
    } else {
      position = 'follower';
      description = 'Performance improvement needed to meet industry standards';
    }

    return { position, description };
  }
}