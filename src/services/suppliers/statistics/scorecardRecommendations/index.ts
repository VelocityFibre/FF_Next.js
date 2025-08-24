/**
 * Scorecard Recommendations - Main Export
 * Re-exports all recommendation components for backward compatibility
 */

import { Supplier } from '@/types/supplier.types';
import { SupplierCompliance } from '../scorecardTypes';
import { RecommendationEngine } from './recommendationEngine';
import { PriorityManager } from './priorityManager';

/**
 * Main ScorecardRecommendations class - maintains backward compatibility
 */
export class ScorecardRecommendations {
  /**
   * Generate comprehensive improvement recommendations
   */
  static generateRecommendations(
    supplier: Supplier,
    overallScore: number,
    compliance: SupplierCompliance
  ): string[] {
    return RecommendationEngine.generateRecommendations(supplier, overallScore, compliance);
  }

  /**
   * Generate priority-based recommendations
   */
  static generatePriorityRecommendations(
    supplier: Supplier,
    overallScore: number,
    compliance: SupplierCompliance
  ): {
    critical: string[];
    high: string[];
    medium: string[];
    low: string[];
  } {
    const allRecommendations = RecommendationEngine.generateRecommendations(supplier, overallScore, compliance);
    const criteria = RecommendationEngine.buildRecommendationCriteria(supplier, overallScore, compliance);

    return PriorityManager.generatePriorityRecommendations(criteria, allRecommendations);
  }

  /**
   * Generate actionable recommendations with specific steps
   */
  static generateActionableRecommendations(
    supplier: Supplier,
    overallScore: number,
    compliance: SupplierCompliance
  ): Array<{
    recommendation: string;
    actions: string[];
    timeframe: string;
    expectedImpact: string;
  }> {
    return RecommendationEngine.generateActionableRecommendations(supplier, overallScore, compliance);
  }
}

// Export individual components for direct access
export { RecommendationEngine } from './recommendationEngine';
export { ScoreBasedRecommender } from './scoreBasedRecommender';
export { PerformanceRecommender } from './performanceRecommender';
export { ComplianceRecommender } from './complianceRecommender';
export { StrategicRecommender } from './strategicRecommender';
export { PriorityManager } from './priorityManager';