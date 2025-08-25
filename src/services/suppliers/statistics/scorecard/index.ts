/**
 * Scorecard Module Exports
 * Clean interface for all scorecard-related functionality
 */

// Import for internal use
import { ScorecardService } from './scorecardService';
import { ScoreCalculator } from './scoreCalculator';
import { BenchmarkCalculator } from './benchmarkCalculator';
import { RecommendationGenerator } from './recommendationGenerator';
import { SupplierUtils } from './utils';

// Main service - check if it exists
export { ScorecardService } from './scorecardService';

// Individual modules - use actual class names
export { ScoreCalculator } from './scoreCalculator';
export { BenchmarkCalculator } from './benchmarkCalculator';
export { RecommendationGenerator } from './recommendationGenerator';
export { SupplierUtils } from './utils';

// Types and interfaces
export type {
  ScorecardConfig,
  RatingBreakdown,
  PerformanceMetrics,
  ComplianceInfo,
  TrendData,
  BenchmarkData,
  ScoreWeights,
  ScorecardGenerationResult,
  BatchScorecardOptions
} from './types';

// Constants
export {
  DEFAULT_SCORE_WEIGHTS,
  COMPLIANCE_THRESHOLDS,
  RECOMMENDATION_THRESHOLDS
} from './types';

// Legacy compatibility - Re-export with fallback implementations
export class ScorecardGenerator {
  /**
   * @deprecated Use ScorecardService.generateSupplierScorecard instead
   */
  static async generateSupplierScorecard(supplierId: string) {
    try {
      const result = await ScorecardService.generateSupplierScorecard(supplierId);
      return result.scorecard;
    } catch (error) {
      console.warn('ScorecardService not available, using fallback');
      return null;
    }
  }

  /**
   * @deprecated Use ScorecardService.generateMultipleScorecards instead
   */
  static async generateMultipleScorecards(supplierIds: string[]) {
    try {
      return ScorecardService.generateMultipleScorecards(supplierIds);
    } catch (error) {
      console.warn('ScorecardService not available, using fallback');
      return [];
    }
  }

  // Re-export static methods for backward compatibility
  static calculateOverallScore = ScoreCalculator.calculateOverallScore;
  static extractRatings = ScoreCalculator.extractRatings;
  static extractPerformance = ScoreCalculator.extractPerformance;
  static extractCompliance = ScoreCalculator.extractCompliance;
  static calculateTrends = BenchmarkCalculator.calculateTrends;
  static calculateBenchmarks = BenchmarkCalculator.calculateBenchmarks;
  static generateRecommendations = RecommendationGenerator.generateRecommendations;
  static calculatePercentile = SupplierUtils.calculatePercentile;
  static getSupplierRating = SupplierUtils.getSupplierRating;
}