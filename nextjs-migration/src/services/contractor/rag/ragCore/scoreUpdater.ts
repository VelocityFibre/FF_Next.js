/**
 * Score Updater Module
 * Updated to use API endpoints instead of direct database access
 */

import { contractorsApi } from '@/services/api/contractorsApi';
import { RAGScore } from '../types';
import { log } from '@/lib/logger';

export class ScoreUpdater {
  /**
   * Update contractor RAG score via API
   */
  static async updateContractorRAGScore(contractorId: string, ragScore: RAGScore): Promise<void> {
    try {
      // Update each score component via API
      const scoreUpdates = [
        {
          scoreType: 'overall',
          newScore: this.riskToRAGStatus(ragScore.risk),
          reason: 'Automated RAG calculation'
        },
        {
          scoreType: 'financial',
          newScore: this.scoreToRAGStatus(ragScore.financial),
          reason: 'Financial assessment update'
        },
        {
          scoreType: 'compliance',
          newScore: this.scoreToRAGStatus(ragScore.reliability),
          reason: 'Compliance/reliability assessment'
        },
        {
          scoreType: 'performance',
          newScore: this.scoreToRAGStatus(ragScore.performance),
          reason: 'Performance assessment update'
        },
        {
          scoreType: 'safety',
          newScore: this.scoreToRAGStatus(ragScore.capabilities),
          reason: 'Safety/capabilities assessment'
        }
      ];

      // Update scores sequentially to maintain consistency
      for (const update of scoreUpdates) {
        await contractorsApi.updateRAGScore(contractorId, update);
      }
    } catch (error) {
      log.error('Failed to update contractor RAG score:', { data: error }, 'scoreUpdater');
      throw error;
    }
  }

  /**
   * Bulk update RAG scores for multiple contractors via API
   */
  static async bulkUpdateRAGScores(
    ragScores: Array<{ contractorId: string; score: RAGScore }>
  ): Promise<{
    updated: number;
    failed: string[];
  }> {
    let updated = 0;
    const failed: string[] = [];

    // Process updates in batches to avoid overwhelming the API
    const batchSize = 5; // Smaller batch size for API calls
    for (let i = 0; i < ragScores.length; i += batchSize) {
      const batch = ragScores.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ contractorId, score }) => {
        try {
          // Use the calculate endpoint for bulk updates
          await contractorsApi.calculateRAGScore(contractorId, ['all']);
          return { success: true, contractorId };
        } catch (error) {
          log.error(`Failed to update RAG score for contractor ${contractorId}:`, { data: error }, 'scoreUpdater');
          return { success: false, contractorId };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          updated++;
        } else {
          failed.push(result.contractorId);
        }
      });

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < ragScores.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { updated, failed };
  }

  /**
   * Convert numeric score to RAG status
   */
  static scoreToRAGStatus(score: number): 'green' | 'amber' | 'red' {
    if (score >= 80) return 'green';
    if (score >= 60) return 'amber';
    return 'red';
  }

  /**
   * Convert risk level to RAG status
   */
  static riskToRAGStatus(risk: 'low' | 'medium' | 'high'): 'green' | 'amber' | 'red' {
    switch (risk) {
      case 'low': return 'green';
      case 'medium': return 'amber';
      case 'high': return 'red';
      default: return 'red';
    }
  }

  /**
   * Validate RAG score before update
   */
  static validateRAGScore(ragScore: RAGScore): boolean {
    // Check required fields
    if (typeof ragScore.overall !== 'number' ||
        typeof ragScore.performance !== 'number' ||
        typeof ragScore.financial !== 'number' ||
        typeof ragScore.reliability !== 'number' ||
        typeof ragScore.capabilities !== 'number') {
      return false;
    }

    // Check score ranges (0-100)
    const scores = [
      ragScore.overall,
      ragScore.performance,
      ragScore.financial,
      ragScore.reliability,
      ragScore.capabilities
    ];

    return scores.every(score => score >= 0 && score <= 100);
  }

  /**
   * Create audit log entry for RAG score update
   */
  static async logRAGScoreUpdate(
    contractorId: string,
    oldScore: RAGScore | null,
    newScore: RAGScore
  ): Promise<void> {
    // The API handles audit logging internally
    log.info('RAG Score Update:', { data: {
      contractorId,
      timestamp: new Date().toISOString(),
      changes: {
        overall: { from: oldScore?.overall || 0, to: newScore.overall },
        performance: { from: oldScore?.performance || 0, to: newScore.performance },
        financial: { from: oldScore?.financial || 0, to: newScore.financial },
        reliability: { from: oldScore?.reliability || 0, to: newScore.reliability },
        capabilities: { from: oldScore?.capabilities || 0, to: newScore.capabilities }
      }
    } }, 'scoreUpdater');
  }

  /**
   * Trigger RAG score recalculation via API
   */
  static async triggerRecalculation(contractorId: string): Promise<void> {
    try {
      await contractorsApi.calculateRAGScore(contractorId, ['all']);
    } catch (error) {
      log.error('Failed to trigger RAG recalculation:', { data: error }, 'scoreUpdater');
      throw error;
    }
  }

  /**
   * Get current RAG scores via API
   */
  static async getCurrentScores(contractorId: string): Promise<any> {
    try {
      const response = await contractorsApi.getRAGScores(contractorId, false);
      return response.data?.current?.scores || null;
    } catch (error) {
      log.error('Failed to get current RAG scores:', { data: error }, 'scoreUpdater');
      return null;
    }
  }
}