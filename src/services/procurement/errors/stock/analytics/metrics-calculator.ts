/**
 * Metrics Calculator
 * Calculate error metrics, KPIs and benchmarks for stock errors
 */

import { StockError, InsufficientStockError } from '../inventory';
import { StockAdjustmentError } from '../tracking';
import { 
  ErrorMetrics,
  TimeframeConfig,
  CriticalityAssessment
} from './analytics-types';

/**
 * Metrics calculation and benchmarking
 */
export class MetricsCalculator {
  /**
   * Calculate error metrics and KPIs
   */
  static calculateErrorMetrics(errors: StockError[], timeframe: TimeframeConfig): ErrorMetrics {
    const totalHours = (timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60);
    const totalDays = Math.max(1, totalHours / 24);

    // Calculate error criticality
    const criticality = this.calculateCriticality(errors);

    // Calculate error distribution
    const errorDistribution = this.calculateErrorDistribution(errors);

    return {
      totalErrors: errors.length,
      errorRate: errors.length / totalDays,
      meanTimeToResolution: 0, // Would need actual resolution data
      errorDistribution,
      criticality,
      trends: {
        increasing: false, // Would need historical data
        changeRate: 0 // Would need historical comparison
      }
    };
  }

  /**
   * Calculate advanced metrics
   */
  static calculateAdvancedMetrics(errors: StockError[]): {
    errorFrequencyIndex: number;
    diversityIndex: number;
    impactScore: number;
    resolutionComplexity: number;
  } {
    const totalErrors = errors.length;

    // Error frequency index (higher = more concentrated errors)
    const errorFrequencyIndex = this.calculateConcentrationIndex(errors);

    // Diversity index (higher = more diverse error types)
    const diversityIndex = this.calculateDiversityIndex(errors);

    // Impact score based on error criticality
    const impactScore = this.calculateImpactScore(errors);

    // Resolution complexity based on error patterns
    const resolutionComplexity = this.calculateResolutionComplexity(errors);

    return {
      errorFrequencyIndex,
      diversityIndex,
      impactScore,
      resolutionComplexity
    };
  }

  /**
   * Generate performance benchmarks
   */
  static generateBenchmarks(errors: StockError[], timeframe: TimeframeConfig): {
    errorRateBenchmark: { current: number; target: number; status: 'above' | 'at' | 'below' };
    resolutionTimeBenchmark: { current: number; target: number; status: 'above' | 'at' | 'below' };
    qualityScore: { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' };
    improvementAreas: string[];
  } {
    const metrics = this.calculateErrorMetrics(errors, timeframe);
    const targetErrorRate = 2; // errors per day target

    const errorRateBenchmark = {
      current: metrics.errorRate,
      target: targetErrorRate,
      status: metrics.errorRate > targetErrorRate ? 'above' as const : 
              metrics.errorRate === targetErrorRate ? 'at' as const : 'below' as const
    };

    const targetResolutionTime = 4; // hours
    const resolutionTimeBenchmark = {
      current: metrics.meanTimeToResolution,
      target: targetResolutionTime,
      status: metrics.meanTimeToResolution > targetResolutionTime ? 'above' as const :
              metrics.meanTimeToResolution === targetResolutionTime ? 'at' as const : 'below' as const
    };

    // Calculate quality score based on various factors
    const qualityScore = this.calculateQualityScore(errors, metrics);

    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(errors, metrics);

    return {
      errorRateBenchmark,
      resolutionTimeBenchmark,
      qualityScore,
      improvementAreas
    };
  }

  /**
   * Calculate error criticality
   */
  private static calculateCriticality(errors: StockError[]): CriticalityAssessment {
    const criticality = { critical: 0, high: 0, medium: 0, low: 0 };
    
    errors.forEach(error => {
      if (error instanceof InsufficientStockError && error.availableQuantity === 0) {
        criticality.high++;
      } else if (error instanceof StockAdjustmentError && Math.abs(error.adjustmentQuantity) > 100) {
        criticality.high++;
      } else if (error instanceof InsufficientStockError) {
        criticality.medium++;
      } else {
        criticality.low++;
      }
    });

    return criticality;
  }

  /**
   * Calculate error distribution by type
   */
  private static calculateErrorDistribution(errors: StockError[]): Record<string, number> {
    const errorDistribution: Record<string, number> = {};
    
    errors.forEach(error => {
      const type = error.constructor.name;
      errorDistribution[type] = (errorDistribution[type] || 0) + 1;
    });

    return errorDistribution;
  }

  /**
   * Calculate concentration index for error frequency
   */
  private static calculateConcentrationIndex(errors: StockError[]): number {
    const itemErrorCounts = new Map<string, number>();
    
    errors.forEach(error => {
      if ('itemCode' in error && error.itemCode) {
        itemErrorCounts.set(error.itemCode, (itemErrorCounts.get(error.itemCode) || 0) + 1);
      }
    });

    if (itemErrorCounts.size === 0) return 0;

    const totalErrors = errors.length;
    const squaredProportions = Array.from(itemErrorCounts.values()).map(count => 
      Math.pow(count / totalErrors, 2)
    );
    
    return squaredProportions.reduce((sum, prop) => sum + prop, 0);
  }

  /**
   * Calculate diversity index for error types
   */
  private static calculateDiversityIndex(errors: StockError[]): number {
    if (errors.length === 0) return 0;

    const errorTypeCounts = new Map<string, number>();
    errors.forEach(error => {
      const type = error.constructor.name;
      errorTypeCounts.set(type, (errorTypeCounts.get(type) || 0) + 1);
    });

    const totalErrors = errors.length;
    const proportions = Array.from(errorTypeCounts.values()).map(count => count / totalErrors);
    
    return -proportions.reduce((sum, prop) => sum + (prop * Math.log(prop)), 0);
  }

  /**
   * Calculate overall impact score
   */
  private static calculateImpactScore(errors: StockError[]): number {
    let impactScore = 0;
    
    errors.forEach(error => {
      if (error instanceof InsufficientStockError && error.availableQuantity === 0) {
        impactScore += 10; // High impact
      } else if (error instanceof StockAdjustmentError && Math.abs(error.adjustmentQuantity) > 100) {
        impactScore += 8;
      } else if (error instanceof InsufficientStockError) {
        impactScore += 5;
      } else {
        impactScore += 2;
      }
    });

    return errors.length > 0 ? impactScore / errors.length : 0;
  }

  /**
   * Calculate resolution complexity
   */
  private static calculateResolutionComplexity(errors: StockError[]): number {
    let complexity = 0;
    
    // Count unique items
    const uniqueItems = new Set<string>();
    const uniqueLocations = new Set<string>();
    
    errors.forEach(error => {
      if ('itemCode' in error && error.itemCode) {
        uniqueItems.add(error.itemCode);
      }
      
      // Extract location
      if ('location' in error && error.location) {
        uniqueLocations.add(error.location);
      } else if ('fromLocation' in error && error.fromLocation) {
        uniqueLocations.add(error.fromLocation);
      }
    });
    
    // More items/locations = higher complexity
    complexity += uniqueItems.size * 0.5;
    complexity += uniqueLocations.size * 0.3;
    
    // More error types = higher complexity
    const uniqueErrorTypes = new Set(errors.map(e => e.constructor.name));
    complexity += uniqueErrorTypes.size * 1;

    return Math.min(10, complexity); // Cap at 10
  }

  /**
   * Calculate quality score
   */
  private static calculateQualityScore(errors: StockError[], metrics: ErrorMetrics): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' } {
    let score = 100;

    // Deduct points based on error rate
    if (metrics.errorRate > 5) score -= 30;
    else if (metrics.errorRate > 3) score -= 20;
    else if (metrics.errorRate > 1) score -= 10;

    // Deduct points based on criticality
    const { high, critical } = metrics.criticality;
    score -= critical * 5 + high * 3;

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    const grade: 'A' | 'B' | 'C' | 'D' | 'F' = 
      score >= 90 ? 'A' :
      score >= 80 ? 'B' :
      score >= 70 ? 'C' :
      score >= 60 ? 'D' : 'F';

    return { score, grade };
  }

  /**
   * Identify improvement areas
   */
  private static identifyImprovementAreas(errors: StockError[], metrics: ErrorMetrics): string[] {
    const areas: string[] = [];

    if (metrics.errorRate > 3) {
      areas.push('Reduce overall error rate');
    }

    if (metrics.criticality.high + metrics.criticality.critical > errors.length * 0.3) {
      areas.push('Address high-impact errors');
    }

    const insufficientStockCount = metrics.errorDistribution['InsufficientStockError'] || 0;
    if (insufficientStockCount > errors.length * 0.5) {
      areas.push('Improve inventory management');
    }

    const adjustmentErrors = metrics.errorDistribution['StockAdjustmentError'] || 0;
    if (adjustmentErrors > errors.length * 0.2) {
      areas.push('Enhance stock adjustment processes');
    }

    return areas;
  }
}