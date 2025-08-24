/**
 * Priority Manager
 * Handles prioritization and categorization of recommendations
 */

import { RecommendationCriteria } from '../scorecardTypes';

export class PriorityManager {
  /**
   * Generate priority-based recommendations
   */
  static generatePriorityRecommendations(
    criteria: RecommendationCriteria,
    allRecommendations: string[]
  ): {
    critical: string[];
    high: string[];
    medium: string[];
    low: string[];
  } {
    return {
      critical: this.getCriticalPriorityRecommendations(criteria, allRecommendations),
      high: this.getHighPriorityRecommendations(criteria, allRecommendations),
      medium: this.getMediumPriorityRecommendations(criteria, allRecommendations),
      low: this.getLowPriorityRecommendations(criteria, allRecommendations)
    };
  }

  /**
   * Get critical priority recommendations
   */
  private static getCriticalPriorityRecommendations(
    criteria: RecommendationCriteria,
    allRecommendations: string[]
  ): string[] {
    const critical: string[] = [];

    if (criteria.overallScore < 40) {
      critical.push(...allRecommendations.filter(rec => 
        rec.includes('Critical') || rec.includes('immediate')
      ));
    }

    if (criteria.complianceScore < 60) {
      critical.push(...allRecommendations.filter(rec => 
        rec.includes('compliance gaps') || rec.includes('compliance documentation')
      ));
    }

    return critical;
  }

  /**
   * Get high priority recommendations
   */
  private static getHighPriorityRecommendations(
    criteria: RecommendationCriteria,
    allRecommendations: string[]
  ): string[] {
    const high: string[] = [];

    if (criteria.performanceMetrics.onTimeDelivery < 80) {
      high.push(...allRecommendations.filter(rec => 
        rec.includes('delivery') && !rec.includes('maintain')
      ));
    }

    if (criteria.performanceMetrics.qualityScore < 75) {
      high.push(...allRecommendations.filter(rec => 
        rec.includes('quality') && !rec.includes('maintain')
      ));
    }

    return high;
  }

  /**
   * Get medium priority recommendations
   */
  private static getMediumPriorityRecommendations(
    criteria: RecommendationCriteria,
    allRecommendations: string[]
  ): string[] {
    return allRecommendations.filter(rec => 
      rec.includes('improve') || 
      rec.includes('enhance') || 
      rec.includes('optimize')
    );
  }

  /**
   * Get low priority recommendations
   */
  private static getLowPriorityRecommendations(
    criteria: RecommendationCriteria,
    allRecommendations: string[]
  ): string[] {
    return allRecommendations.filter(rec => 
      rec.includes('maintain') || 
      rec.includes('consider') || 
      rec.includes('explore')
    );
  }

  /**
   * Calculate priority score for a recommendation
   */
  static calculatePriorityScore(
    recommendation: string,
    criteria: RecommendationCriteria
  ): {
    score: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    urgency: number;
    impact: number;
  } {
    let urgency = 1;
    let impact = 1;

    // Urgency factors
    if (recommendation.includes('critical') || recommendation.includes('immediate')) {
      urgency = 5;
    } else if (recommendation.includes('urgent') || criteria.overallScore < 40) {
      urgency = 4;
    } else if (recommendation.includes('priority') || criteria.overallScore < 60) {
      urgency = 3;
    } else if (criteria.overallScore < 80) {
      urgency = 2;
    }

    // Impact factors
    if (recommendation.includes('comprehensive') || recommendation.includes('system')) {
      impact = 5;
    } else if (recommendation.includes('improve') || recommendation.includes('enhance')) {
      impact = 4;
    } else if (recommendation.includes('establish') || recommendation.includes('implement')) {
      impact = 3;
    } else if (recommendation.includes('optimize') || recommendation.includes('fine-tune')) {
      impact = 2;
    }

    const score = urgency * impact;
    let priority: 'critical' | 'high' | 'medium' | 'low';

    if (score >= 20) {
      priority = 'critical';
    } else if (score >= 12) {
      priority = 'high';
    } else if (score >= 6) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    return { score, priority, urgency, impact };
  }

  /**
   * Sort recommendations by priority and impact
   */
  static sortRecommendationsByPriority(
    recommendations: string[],
    criteria: RecommendationCriteria
  ): Array<{
    recommendation: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    score: number;
  }> {
    return recommendations
      .map(rec => ({
        recommendation: rec,
        ...this.calculatePriorityScore(rec, criteria)
      }))
      .sort((a, b) => b.score - a.score);
  }
}