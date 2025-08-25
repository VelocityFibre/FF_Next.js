/**
 * RAG Core - Main Export
 * Re-exports all RAG core components for backward compatibility
 */

import {
  RAGScore,
  RankedContractor
} from '../types';
import { DataRetrieval } from './dataRetrieval';
import { ScoreCalculation } from './scoreCalculation';
import { ScoreUpdater } from './scoreUpdater';

/**
 * Main RAG Core class - maintains backward compatibility
 */
export class RAGCore {
  /**
   * Calculate comprehensive RAG score for a contractor
   */
  async calculateRAGScore(contractorId: string): Promise<RAGScore> {
    try {
      // Get contractor data
      const { contractor, assignments, teams } = await DataRetrieval.getContractorData(contractorId);

      // Calculate score components
      const components = ScoreCalculation.calculateRAGComponents(contractor, assignments, teams);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(components.overall, components);

      // Build complete RAG score
      return ScoreCalculation.buildRAGScore(components, recommendations);
    } catch (error) {
      console.error('Failed to calculate RAG score:', error);
      throw error;
    }
  }

  /**
   * Get RAG scores for multiple contractors
   */
  async getContractorRAGScores(contractorIds: string[]): Promise<Map<string, RAGScore>> {
    const scores = new Map<string, RAGScore>();
    
    // Get contractor data in batches
    const contractorData = await DataRetrieval.getBatchContractorData(contractorIds);
    
    // Calculate scores for valid data
    const validData = contractorData
      .filter(({ data }) => data !== null)
      .map(({ contractorId: _contractorId, data }) => ({
        contractor: data!.contractor,
        assignments: data!.assignments,
        teams: data!.teams
      }));

    const scoreResults = await ScoreCalculation.calculateBatchScores(validData);
    
    scoreResults.forEach(({ contractorId, score }) => {
      if (score) {
        scores.set(contractorId, score);
      }
    });
    
    return scores;
  }

  /**
   * Get contractors ranked by RAG score
   */
  async getRankedContractors(limit: number = 50): Promise<RankedContractor[]> {
    try {
      const contractorList = await DataRetrieval.getContractorsList(limit);
      const rankedContractors: RankedContractor[] = [];

      // Get RAG scores for all contractors
      const contractorIds = contractorList.map(c => c.id);
      const ragScores = await this.getContractorRAGScores(contractorIds);

      // Build ranked contractor objects
      contractorList.forEach(contractor => {
        const ragScore = ragScores.get(contractor.id);
        if (ragScore) {
          rankedContractors.push({
            contractorId: contractor.id,
            companyName: contractor.companyName,
            ragScore
          });
        }
      });

      // Sort by overall score (descending)
      return rankedContractors.sort((a, b) => b.ragScore.overall - a.ragScore.overall);
    } catch (error) {
      console.error('Failed to get ranked contractors:', error);
      throw error;
    }
  }

  /**
   * Update contractor RAG score in database
   */
  async updateContractorRAGScore(contractorId: string, ragScore: RAGScore): Promise<void> {
    return ScoreUpdater.updateContractorRAGScore(contractorId, ragScore);
  }

  /**
   * Bulk update RAG scores for multiple contractors
   */
  async bulkUpdateRAGScores(contractorIds: string[]): Promise<{
    updated: number;
    failed: string[];
  }> {
    const ragScoresData: Array<{ contractorId: string; score: RAGScore }> = [];
    
    // Calculate scores for all contractors
    for (const contractorId of contractorIds) {
      try {
        const ragScore = await this.calculateRAGScore(contractorId);
        ragScoresData.push({ contractorId, score: ragScore });
      } catch (error) {
        console.error(`Failed to calculate RAG score for contractor ${contractorId}:`, error);
      }
    }

    // Update all scores in batch
    return ScoreUpdater.bulkUpdateRAGScores(ragScoresData);
  }

  /**
   * Generate recommendations (private method)
   */
  private generateRecommendations(
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

// Export individual components for direct access
export { DataRetrieval } from './dataRetrieval';
export { ScoreCalculation } from './scoreCalculation';
export { ScoreUpdater } from './scoreUpdater';

// Export singleton instance
export const ragCore = new RAGCore();