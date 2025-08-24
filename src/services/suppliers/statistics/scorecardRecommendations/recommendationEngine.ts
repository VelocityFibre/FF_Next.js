/**
 * Recommendation Engine Core
 * Main recommendation generation logic
 */

import { Supplier } from '@/types/supplier.types';
import { 
  RecommendationCriteria,
  SupplierCompliance
} from '../scorecardTypes';
import { ScorecardCalculator } from '../scorecardCalculator';
import { ScoreBasedRecommender } from './scoreBasedRecommender';
import { PerformanceRecommender } from './performanceRecommender';
import { ComplianceRecommender } from './complianceRecommender';
import { StrategicRecommender } from './strategicRecommender';

export class RecommendationEngine {
  /**
   * Generate comprehensive improvement recommendations
   */
  static generateRecommendations(
    supplier: Supplier,
    overallScore: number,
    compliance: SupplierCompliance
  ): string[] {
    const criteria = this.buildRecommendationCriteria(supplier, overallScore, compliance);
    const recommendations: string[] = [];

    // Add different types of recommendations
    recommendations.push(...ScoreBasedRecommender.getScoreBasedRecommendations(criteria));
    recommendations.push(...PerformanceRecommender.getRatingBasedRecommendations(criteria));
    recommendations.push(...PerformanceRecommender.getPerformanceBasedRecommendations(criteria));
    recommendations.push(...ComplianceRecommender.getComplianceBasedRecommendations(criteria));
    recommendations.push(...PerformanceRecommender.getCommunicationRecommendations(criteria));
    recommendations.push(...StrategicRecommender.getStrategicRecommendations(criteria));

    // Remove duplicates and ensure we have at least one recommendation
    const uniqueRecommendations = [...new Set(recommendations)];
    
    if (uniqueRecommendations.length === 0) {
      uniqueRecommendations.push('Maintain current excellent performance standards');
    }

    return uniqueRecommendations.slice(0, 8); // Limit to top 8 recommendations
  }

  /**
   * Build criteria object for recommendation generation
   */
  static buildRecommendationCriteria(
    supplier: Supplier,
    overallScore: number,
    compliance: SupplierCompliance
  ): RecommendationCriteria {
    return {
      overallScore,
      rating: ScorecardCalculator.extractSupplierRating(supplier),
      complianceScore: compliance.score,
      performanceMetrics: ScorecardCalculator.extractPerformance(supplier),
      isPreferred: supplier.isPreferred || false,
      hasCompleteContact: !!(supplier.primaryContact?.email && supplier.primaryContact?.phone)
    };
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
    const criteria = this.buildRecommendationCriteria(supplier, overallScore, compliance);
    const actionableRecs: Array<{
      recommendation: string;
      actions: string[];
      timeframe: string;
      expectedImpact: string;
    }> = [];

    // Example actionable recommendation
    if (criteria.performanceMetrics.onTimeDelivery < 90) {
      actionableRecs.push({
        recommendation: 'Improve delivery time consistency',
        actions: [
          'Analyze current delivery performance data',
          'Identify common delay causes',
          'Implement delivery tracking system',
          'Establish delivery performance targets',
          'Monitor and report weekly delivery metrics'
        ],
        timeframe: '3 months',
        expectedImpact: '+10-15 points in delivery score'
      });
    }

    if (criteria.complianceScore < 80) {
      actionableRecs.push({
        recommendation: 'Update compliance documentation',
        actions: [
          'Conduct compliance gap analysis',
          'Update expired certifications',
          'Document all compliance procedures',
          'Schedule regular compliance audits',
          'Train staff on compliance requirements'
        ],
        timeframe: '2 months',
        expectedImpact: '+15-20 points in compliance score'
      });
    }

    return actionableRecs;
  }
}