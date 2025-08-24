/**
 * Performance Recommender
 * Generates recommendations based on performance metrics and ratings
 */

import { RecommendationCriteria } from '../scorecardTypes';

export class PerformanceRecommender {
  /**
   * Generate rating-based recommendations
   */
  static getRatingBasedRecommendations(criteria: RecommendationCriteria): string[] {
    const recommendations: string[] = [];

    if (criteria.rating < 2.5) {
      recommendations.push('Immediate action required to improve service quality and customer satisfaction');
      recommendations.push('Implement customer feedback collection and response system');
    } else if (criteria.rating < 3.5) {
      recommendations.push('Focus on improving service quality and customer satisfaction');
      recommendations.push('Establish customer service excellence training program');
    } else if (criteria.rating < 4.0) {
      recommendations.push('Continue building on current service strengths');
      recommendations.push('Implement customer loyalty and retention initiatives');
    }

    return recommendations;
  }

  /**
   * Generate performance-based recommendations
   */
  static getPerformanceBasedRecommendations(criteria: RecommendationCriteria): string[] {
    const recommendations: string[] = [];
    const { performanceMetrics } = criteria;

    // On-time delivery recommendations
    if (performanceMetrics.onTimeDelivery < 80) {
      recommendations.push('Improve delivery time consistency and logistics planning');
      recommendations.push('Implement delivery tracking and early warning systems');
    } else if (performanceMetrics.onTimeDelivery < 95) {
      recommendations.push('Optimize delivery processes for consistent on-time performance');
    }

    // Quality score recommendations
    if (performanceMetrics.qualityScore < 75) {
      recommendations.push('Enhance quality control processes and inspection procedures');
      recommendations.push('Implement quality management system certification (ISO 9001)');
    } else if (performanceMetrics.qualityScore < 90) {
      recommendations.push('Continue quality improvement initiatives and preventive measures');
    }

    // Response time recommendations
    if (performanceMetrics.responseTime < 70) {
      recommendations.push('Improve communication response times and availability');
      recommendations.push('Establish clear communication protocols and escalation procedures');
    }

    // Issue resolution recommendations
    if (performanceMetrics.issueResolution < 75) {
      recommendations.push('Enhance problem-solving capabilities and resolution processes');
      recommendations.push('Implement issue tracking system with resolution time targets');
    }

    return recommendations;
  }

  /**
   * Generate communication-based recommendations
   */
  static getCommunicationRecommendations(criteria: RecommendationCriteria): string[] {
    const recommendations: string[] = [];

    if (!criteria.hasCompleteContact) {
      recommendations.push('Ensure complete contact information is provided and kept current');
      recommendations.push('Designate primary and backup contacts for all communication');
    }

    // Additional communication recommendations based on performance
    if (criteria.performanceMetrics.responseTime < 80) {
      recommendations.push('Improve communication responsiveness and accessibility');
      recommendations.push('Implement automated acknowledgment and status update systems');
    }

    return recommendations;
  }

  /**
   * Generate delivery-specific improvement plan
   */
  static generateDeliveryImprovementPlan(onTimeDelivery: number): Array<{
    action: string;
    timeframe: string;
    expectedImprovement: string;
  }> {
    const plan = [];

    if (onTimeDelivery < 80) {
      plan.push({
        action: 'Implement delivery performance tracking system',
        timeframe: '2 weeks',
        expectedImprovement: '5-10% improvement'
      });
      
      plan.push({
        action: 'Conduct root cause analysis of delivery delays',
        timeframe: '1 month',
        expectedImprovement: '10-15% improvement'
      });
      
      plan.push({
        action: 'Optimize logistics and route planning',
        timeframe: '2 months',
        expectedImprovement: '15-20% improvement'
      });
    }

    return plan;
  }

  /**
   * Generate quality improvement plan
   */
  static generateQualityImprovementPlan(qualityScore: number): Array<{
    action: string;
    timeframe: string;
    expectedImprovement: string;
  }> {
    const plan = [];

    if (qualityScore < 85) {
      plan.push({
        action: 'Implement comprehensive quality control checklist',
        timeframe: '2 weeks',
        expectedImprovement: '5-8% improvement'
      });
      
      plan.push({
        action: 'Establish quality metrics and regular audits',
        timeframe: '1 month',
        expectedImprovement: '8-12% improvement'
      });
      
      plan.push({
        action: 'Train staff on quality management principles',
        timeframe: '6 weeks',
        expectedImprovement: '10-15% improvement'
      });
    }

    return plan;
  }
}