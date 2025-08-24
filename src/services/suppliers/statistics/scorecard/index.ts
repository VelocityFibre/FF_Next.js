/**
 * Scorecard Module Exports
 * Clean interface for all scorecard-related functionality
 */

// Main service
export { ScorecardService } from './scorecardService';

// Individual modules
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

// Legacy compatibility - Re-export the original ScorecardGenerator class
// This maintains backward compatibility while providing the new modular interface
export class ScorecardGenerator {
  /**
   * @deprecated Use ScorecardService.generateSupplierScorecard instead
   */
  static async generateSupplierScorecard(supplierId: string) {
    const result = await ScorecardService.generateSupplierScorecard(supplierId);
    return result.scorecard;
  }

  /**
   * @deprecated Use ScorecardService.generateMultipleScorecards instead
   */
  static async generateMultipleScorecards(supplierIds: string[]) {
    return ScorecardService.generateMultipleScorecards(supplierIds);
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