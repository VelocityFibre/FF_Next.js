/**
 * Compliance Recommender
 * Generates compliance-specific recommendations
 */

import { RecommendationCriteria } from '../scorecardTypes';

export class ComplianceRecommender {
  /**
   * Generate compliance-based recommendations
   */
  static getComplianceBasedRecommendations(criteria: RecommendationCriteria): string[] {
    const recommendations: string[] = [];

    if (criteria.complianceScore < 60) {
      recommendations.push('Critical compliance gaps require immediate attention');
      recommendations.push('Update all compliance documentation and certifications');
      recommendations.push('Implement compliance monitoring and reporting system');
    } else if (criteria.complianceScore < 80) {
      recommendations.push('Update compliance documentation and certifications');
      recommendations.push('Establish regular compliance review and audit schedule');
    } else if (criteria.complianceScore < 90) {
      recommendations.push('Maintain compliance standards with regular monitoring');
    }

    return recommendations;
  }

  /**
   * Generate compliance improvement roadmap
   */
  static generateComplianceRoadmap(complianceScore: number): Array<{
    phase: string;
    duration: string;
    actions: string[];
    priority: 'critical' | 'high' | 'medium' | 'low';
  }> {
    const roadmap = [];

    if (complianceScore < 60) {
      roadmap.push({
        phase: 'Critical Compliance Recovery',
        duration: '30 days',
        actions: [
          'Conduct comprehensive compliance audit',
          'Identify and prioritize critical gaps',
          'Implement emergency compliance measures',
          'Update expired certifications immediately'
        ],
        priority: 'critical' as const
      });
    }

    if (complianceScore < 80) {
      roadmap.push({
        phase: 'Compliance Standardization',
        duration: '60 days',
        actions: [
          'Develop compliance management system',
          'Train staff on compliance requirements',
          'Establish regular audit schedule',
          'Create compliance documentation templates'
        ],
        priority: 'high' as const
      });
    }

    if (complianceScore < 95) {
      roadmap.push({
        phase: 'Compliance Optimization',
        duration: '90 days',
        actions: [
          'Implement automated compliance tracking',
          'Develop compliance performance metrics',
          'Establish continuous improvement process',
          'Create compliance training program'
        ],
        priority: 'medium' as const
      });
    }

    return roadmap;
  }

  /**
   * Get compliance status assessment
   */
  static getComplianceAssessment(complianceScore: number): {
    status: string;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    immediateActions: string[];
  } {
    if (complianceScore < 60) {
      return {
        status: 'Non-Compliant',
        riskLevel: 'critical',
        description: 'Critical compliance deficiencies that require immediate attention',
        immediateActions: [
          'Stop all non-essential operations until compliance is restored',
          'Engage compliance specialist for emergency audit',
          'Notify relevant stakeholders of compliance status'
        ]
      };
    } else if (complianceScore < 75) {
      return {
        status: 'Partially Compliant',
        riskLevel: 'high',
        description: 'Significant compliance gaps that need urgent attention',
        immediateActions: [
          'Develop 30-day compliance improvement plan',
          'Assign dedicated compliance officer',
          'Schedule weekly compliance reviews'
        ]
      };
    } else if (complianceScore < 90) {
      return {
        status: 'Mostly Compliant',
        riskLevel: 'medium',
        description: 'Generally compliant with minor areas for improvement',
        immediateActions: [
          'Address minor compliance gaps',
          'Schedule quarterly compliance audits',
          'Update compliance documentation'
        ]
      };
    } else {
      return {
        status: 'Fully Compliant',
        riskLevel: 'low',
        description: 'Excellent compliance standing with minimal risk',
        immediateActions: [
          'Maintain current compliance standards',
          'Continue annual compliance reviews',
          'Share best practices with other suppliers'
        ]
      };
    }
  }
}