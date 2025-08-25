/**
 * Score Calculation Module
 * Handles RAG score calculation logic
 */

import {
  ContractorAssignment,
  ContractorTeam,
  RAGScore
} from '../types';
import {
  PerformanceCalculator,
  FinancialCalculator,
  ReliabilityCalculator,
  CapabilitiesCalculator,
  RAGScoreCalculator
} from '../calculators';

export class ScoreCalculation {
  /**
   * Calculate comprehensive RAG score components
   */
  static calculateRAGComponents(
    contractor: any,
    assignments: ContractorAssignment[],
    teams: ContractorTeam[]
  ): {
    performance: { score: number; breakdown: any };
    financial: { score: number; breakdown: any };
    reliability: { score: number; breakdown: any };
    capabilities: { score: number; breakdown: any };
    overall: number;
    risk: 'low' | 'medium' | 'high';
  } {
    // Calculate individual component scores
    const performance = PerformanceCalculator.calculateScore(assignments);
    const financial = FinancialCalculator.calculateScore(contractor);
    const reliability = ReliabilityCalculator.calculateScore(assignments, teams);
    const capabilities = CapabilitiesCalculator.calculateScore(contractor, teams);

    // Calculate weighted overall score
    const overall = RAGScoreCalculator.calculateOverallScore({
      performance: performance.score,
      financial: financial.score,
      reliability: reliability.score,
      capabilities: capabilities.score
    });

    // Determine risk level
    const risk = RAGScoreCalculator.determineRiskLevel(overall);

    return {
      performance,
      financial,
      reliability,
      capabilities,
      overall,
      risk
    };
  }

  /**
   * Build complete RAG score object
   */
  static buildRAGScore(
    components: ReturnType<typeof ScoreCalculation.calculateRAGComponents>,
    recommendations: string[]
  ): RAGScore {
    return {
      overall: components.overall,
      risk: components.risk,
      performance: components.performance.score,
      financial: components.financial.score,
      reliability: components.reliability.score,
      capabilities: components.capabilities.score,
      breakdown: {
        performance: components.performance.breakdown,
        financial: components.financial.breakdown,
        reliability: components.reliability.breakdown,
        capabilities: components.capabilities.breakdown
      },
      lastUpdated: new Date(),
      recommendations
    };
  }

  /**
   * Calculate batch RAG scores efficiently
   */
  static async calculateBatchScores(
    contractorData: Array<{
      contractor: any;
      assignments: ContractorAssignment[];
      teams: ContractorTeam[];
    }>,
    batchSize: number = 5
  ): Promise<Array<{ contractorId: string; score: RAGScore | null }>> {
    const results: Array<{ contractorId: string; score: RAGScore | null }> = [];

    // Process contractors in batches
    for (let i = 0; i < contractorData.length; i += batchSize) {
      const batch = contractorData.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ contractor, assignments, teams }) => {
        try {
          const components = this.calculateRAGComponents(contractor, assignments, teams);
          const recommendations = this.generateRecommendations(components.overall, components);
          const score = this.buildRAGScore(components, recommendations);
          
          return { contractorId: contractor.id, score };
        } catch (error) {
          console.error(`Failed to calculate RAG score for contractor ${contractor.id}:`, error);
          return { contractorId: contractor.id, score: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Generate recommendations based on scores
   */
  private static generateRecommendations(
    overallScore: number,
    breakdown: {
      performance: { score: number };
      financial: { score: number };
      reliability: { score: number };
      capabilities: { score: number };
    }
  ): string[] {
    const recommendations: string[] = [];

    // Component-specific recommendations
    if (breakdown.performance.score < 70) {
      recommendations.push('Improve project completion rates and quality metrics');
    }

    if (breakdown.financial.score < 70) {
      recommendations.push('Strengthen financial documentation and payment history');
    }

    if (breakdown.reliability.score < 70) {
      recommendations.push('Focus on building consistent delivery track record');
    }

    if (breakdown.capabilities.score < 70) {
      recommendations.push('Invest in team training and certification programs');
    }

    // Overall score recommendations
    if (overallScore >= 80) {
      recommendations.push('Excellent contractor - suitable for high-value projects');
    } else if (overallScore >= 60) {
      recommendations.push('Good contractor - suitable for standard projects with monitoring');
    } else {
      recommendations.push('High-risk contractor - requires close oversight and improvement plan');
    }

    // Performance-based recommendations
    if (overallScore < 50) {
      recommendations.push('Consider contractor development program before major assignments');
    }

    if (overallScore >= 85) {
      recommendations.push('Preferred contractor - consider for strategic partnerships');
    }

    // Risk mitigation recommendations
    if (breakdown.financial.score < 60) {
      recommendations.push('Require additional financial guarantees or bonding');
    }

    if (breakdown.capabilities.score < 60) {
      recommendations.push('Provide additional supervision and technical support');
    }

    return recommendations;
  }
}