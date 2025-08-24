/**
 * Score-Based Recommender
 * Generates recommendations based on overall performance scores
 */

import { RecommendationCriteria } from '../scorecardTypes';

export class ScoreBasedRecommender {
  /**
   * Generate score-based recommendations
   */
  static getScoreBasedRecommendations(criteria: RecommendationCriteria): string[] {
    const recommendations: string[] = [];

    if (criteria.overallScore < 40) {
      recommendations.push('Critical improvement needed across all performance areas');
      recommendations.push('Implement comprehensive quality management system');
      recommendations.push('Establish regular performance monitoring and review processes');
    } else if (criteria.overallScore < 60) {
      recommendations.push('Focus on key performance improvement areas');
      recommendations.push('Develop action plan to address identified weaknesses');
    } else if (criteria.overallScore < 80) {
      recommendations.push('Fine-tune existing processes for optimal performance');
      recommendations.push('Identify and eliminate performance bottlenecks');
    } else if (criteria.overallScore >= 90) {
      recommendations.push('Share best practices with other suppliers');
      recommendations.push('Consider expanding service offerings or capabilities');
    }

    return recommendations;
  }

  /**
   * Get score category description
   */
  static getScoreCategory(score: number): {
    category: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  } {
    if (score < 40) {
      return {
        category: 'Critical',
        description: 'Immediate intervention required',
        priority: 'critical'
      };
    } else if (score < 60) {
      return {
        category: 'Below Average',
        description: 'Significant improvement needed',
        priority: 'high'
      };
    } else if (score < 80) {
      return {
        category: 'Average',
        description: 'Room for improvement',
        priority: 'medium'
      };
    } else if (score < 90) {
      return {
        category: 'Good',
        description: 'Strong performance with minor improvements',
        priority: 'low'
      };
    } else {
      return {
        category: 'Excellent',
        description: 'Outstanding performance',
        priority: 'low'
      };
    }
  }

  /**
   * Generate improvement roadmap based on score
   */
  static generateImprovementRoadmap(score: number): Array<{
    phase: string;
    duration: string;
    actions: string[];
    expectedImprovement: string;
  }> {
    const roadmap = [];

    if (score < 60) {
      roadmap.push({
        phase: 'Immediate (0-30 days)',
        duration: '1 month',
        actions: [
          'Identify critical performance gaps',
          'Implement emergency corrective measures',
          'Establish daily monitoring protocols'
        ],
        expectedImprovement: '10-15 points'
      });

      roadmap.push({
        phase: 'Short-term (1-3 months)',
        duration: '2 months',
        actions: [
          'Deploy systematic improvement initiatives',
          'Train staff on best practices',
          'Implement quality assurance processes'
        ],
        expectedImprovement: '15-20 points'
      });
    }

    if (score < 80) {
      roadmap.push({
        phase: 'Medium-term (3-6 months)',
        duration: '3 months',
        actions: [
          'Optimize existing processes',
          'Implement technology solutions',
          'Establish performance benchmarks'
        ],
        expectedImprovement: '10-15 points'
      });
    }

    return roadmap;
  }
}