/**
 * Strategic Recommender
 * Generates strategic and high-level business recommendations
 */

import { RecommendationCriteria } from '../scorecardTypes';

export class StrategicRecommender {
  /**
   * Generate strategic recommendations
   */
  static getStrategicRecommendations(criteria: RecommendationCriteria): string[] {
    const recommendations: string[] = [];

    // Preferred status recommendations
    if (!criteria.isPreferred && criteria.overallScore >= 85) {
      recommendations.push('Consider application for preferred supplier status based on excellent performance');
    } else if (criteria.isPreferred && criteria.overallScore < 70) {
      recommendations.push('Address performance issues to maintain preferred supplier status');
    }

    // Growth and development recommendations
    if (criteria.overallScore >= 80) {
      recommendations.push('Explore opportunities for expanded partnership and collaboration');
      recommendations.push('Consider value-added services or innovative solution offerings');
    }

    // Risk mitigation recommendations
    if (criteria.overallScore < 65 || criteria.complianceScore < 70) {
      recommendations.push('Develop risk mitigation plan to address performance concerns');
      recommendations.push('Establish performance improvement timeline with measurable milestones');
    }

    return recommendations;
  }

  /**
   * Generate partnership development recommendations
   */
  static getPartnershipRecommendations(criteria: RecommendationCriteria): Array<{
    type: string;
    description: string;
    benefits: string[];
    requirements: string[];
  }> {
    const partnerships = [];

    if (criteria.overallScore >= 85) {
      partnerships.push({
        type: 'Strategic Partnership',
        description: 'Elevated partnership with expanded responsibilities and benefits',
        benefits: [
          'Priority project allocation',
          'Extended payment terms',
          'Joint business development opportunities',
          'Access to exclusive contracts'
        ],
        requirements: [
          'Maintain >85 overall score',
          'Complete additional certifications',
          'Commit to innovation initiatives',
          'Provide performance guarantees'
        ]
      });
    }

    if (criteria.overallScore >= 75 && !criteria.isPreferred) {
      partnerships.push({
        type: 'Preferred Supplier',
        description: 'Recognition as preferred supplier with additional benefits',
        benefits: [
          'Preferred bidding status',
          'Longer contract terms',
          'Performance bonuses',
          'Marketing collaboration opportunities'
        ],
        requirements: [
          'Maintain >75 overall score',
          'Complete supplier development program',
          'Provide references from other clients',
          'Demonstrate financial stability'
        ]
      });
    }

    return partnerships;
  }

  /**
   * Generate business growth recommendations
   */
  static getBusinessGrowthRecommendations(criteria: RecommendationCriteria): Array<{
    area: string;
    opportunity: string;
    investment: string;
    timeline: string;
    expectedROI: string;
  }> {
    const opportunities = [];

    if (criteria.overallScore >= 80) {
      opportunities.push({
        area: 'Service Expansion',
        opportunity: 'Expand service offerings to include related specialties',
        investment: 'Medium',
        timeline: '6-12 months',
        expectedROI: '20-30% revenue increase'
      });

      opportunities.push({
        area: 'Technology Integration',
        opportunity: 'Implement advanced tracking and reporting systems',
        investment: 'High',
        timeline: '3-6 months',
        expectedROI: '15-25% efficiency improvement'
      });
    }

    if (criteria.performanceMetrics.qualityScore >= 90) {
      opportunities.push({
        area: 'Quality Certification',
        opportunity: 'Pursue industry-leading quality certifications',
        investment: 'Medium',
        timeline: '6-9 months',
        expectedROI: '10-15% premium pricing'
      });
    }

    return opportunities;
  }

  /**
   * Generate risk mitigation strategies
   */
  static getRiskMitigationStrategies(criteria: RecommendationCriteria): Array<{
    riskType: string;
    probability: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    mitigationActions: string[];
  }> {
    const strategies = [];

    if (criteria.overallScore < 65) {
      strategies.push({
        riskType: 'Performance Risk',
        probability: 'high' as const,
        impact: 'high' as const,
        mitigationActions: [
          'Implement weekly performance monitoring',
          'Establish performance improvement plan with milestones',
          'Provide additional training and resources',
          'Consider contract modifications or penalties'
        ]
      });
    }

    if (criteria.complianceScore < 70) {
      strategies.push({
        riskType: 'Compliance Risk',
        probability: 'high' as const,
        impact: 'high' as const,
        mitigationActions: [
          'Conduct immediate compliance audit',
          'Engage compliance consultant',
          'Implement compliance monitoring system',
          'Establish regular compliance reviews'
        ]
      });
    }

    return strategies;
  }
}