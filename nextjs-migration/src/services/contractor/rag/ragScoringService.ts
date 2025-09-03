/**
 * RAG Scoring Service - Main Instance
 * Provides the main RAG scoring service interface
 */

import { ragCore } from './ragCore';

// Create wrapper class to maintain API compatibility
class RAGScoringService {
  /**
   * Calculate comprehensive RAG score for a contractor
   */
  async calculateRAGScore(contractorId: string) {
    return ragCore.calculateRAGScore(contractorId);
  }

  /**
   * Get RAG scores for multiple contractors
   */
  async getContractorRAGScores(contractorIds: string[]) {
    return ragCore.getContractorRAGScores(contractorIds);
  }

  /**
   * Get contractors ranked by RAG score
   */
  async getRankedContractors(limit: number = 50) {
    return ragCore.getRankedContractors(limit);
  }

  /**
   * Update contractor RAG score in database
   */
  async updateContractorRAGScore(contractorId: string, ragScore: any) {
    return ragCore.updateContractorRAGScore(contractorId, ragScore);
  }

  /**
   * Bulk update RAG scores for multiple contractors
   */
  async bulkUpdateRAGScores(contractorIds: string[]) {
    return ragCore.bulkUpdateRAGScores(contractorIds);
  }
}

// Export singleton instance
export const ragScoringService = new RAGScoringService();