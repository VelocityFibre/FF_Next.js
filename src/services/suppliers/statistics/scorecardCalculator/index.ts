/**
 * Scorecard Calculator - Main Export
 * Re-exports all calculator components for backward compatibility
 */

import { Supplier } from '@/types/supplier/base.types';
import { 
  ScoreCalculationWeights,
  ScoreCalculationResult,
  SupplierRatings,
  SupplierPerformance,
  SupplierCompliance
} from '../scorecardTypes';
import { CoreCalculations } from './coreCalculations';
import { DataExtractors } from './dataExtractors';

/**
 * Main ScorecardCalculator class - maintains backward compatibility
 */
export class ScorecardCalculator {
  /**
   * Calculate overall supplier score with detailed breakdown
   */
  static calculateOverallScore(supplier: Supplier, customWeights?: Partial<ScoreCalculationWeights>): number {
    return CoreCalculations.calculateOverallScore(supplier, customWeights);
  }

  /**
   * Calculate detailed score with breakdown
   */
  static calculateDetailedScore(
    supplier: Supplier, 
    customWeights?: Partial<ScoreCalculationWeights>
  ): ScoreCalculationResult {
    return CoreCalculations.calculateDetailedScore(supplier, customWeights);
  }

  /**
   * Extract detailed ratings breakdown
   */
  static extractRatings(supplier: Supplier): SupplierRatings {
    return DataExtractors.extractRatings(supplier);
  }

  /**
   * Extract performance metrics with validation
   */
  static extractPerformance(supplier: Supplier): SupplierPerformance {
    return DataExtractors.extractPerformance(supplier);
  }

  /**
   * Extract compliance information with validation
   */
  static extractCompliance(supplier: Supplier): SupplierCompliance {
    return DataExtractors.extractCompliance(supplier);
  }

  /**
   * Calculate response score based on supplier data
   */
  static calculateResponseScore(supplier: Supplier): number {
    return CoreCalculations.calculateResponseScore(supplier);
  }

  /**
   * Extract supplier rating value
   */
  static extractSupplierRating(supplier: Supplier): number {
    return DataExtractors.extractSupplierRating(supplier);
  }

  /**
   * Extract performance score from supplier data
   */
  static extractPerformanceScore(supplier: Supplier): number {
    return DataExtractors.extractPerformanceScore(supplier);
  }

  /**
   * Extract compliance score from supplier data
   */
  static extractComplianceScore(supplier: Supplier): number {
    return DataExtractors.extractComplianceScore(supplier);
  }

  /**
   * Determine compliance status string based on score
   */
  static determineComplianceStatus(score: number): string {
    return DataExtractors.determineComplianceStatus(score);
  }

  /**
   * Calculate weighted average score
   */
  static calculateWeightedAverage(scores: number[], weights: number[]): number {
    return CoreCalculations.calculateWeightedAverage(scores, weights);
  }

  /**
   * Calculate rating category average
   */
  static calculateRatingCategoryAverage(ratings: SupplierRatings): number {
    return DataExtractors.calculateRatingCategoryAverage(ratings);
  }

  /**
   * Calculate performance category average
   */
  static calculatePerformanceCategoryAverage(performance: SupplierPerformance): number {
    return DataExtractors.calculatePerformanceCategoryAverage(performance);
  }

  /**
   * Get score interpretation
   */
  static getScoreInterpretation(score: number) {
    return CoreCalculations.getScoreInterpretation(score);
  }
}

// Export individual components for direct access
export { CoreCalculations } from './coreCalculations';
export { DataExtractors } from './dataExtractors';
