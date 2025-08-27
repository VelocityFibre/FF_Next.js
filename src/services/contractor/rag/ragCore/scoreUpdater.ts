/**
 * Score Updater Module
 * Handles updating RAG scores in the database
 */

import { db } from '@/lib/neon/connection';
import { contractors } from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';
import { RAGScore } from '../types';
import { log } from '@/lib/logger';

export class ScoreUpdater {
  /**
   * Update contractor RAG score in database
   */
  static async updateContractorRAGScore(contractorId: string, ragScore: RAGScore): Promise<void> {
    try {
      await db
        .update(contractors)
        .set({
          ragOverall: ragScore.risk === 'low' ? 'green' : ragScore.risk === 'medium' ? 'amber' : 'red',
          ragFinancial: ragScore.financial >= 80 ? 'green' : ragScore.financial >= 60 ? 'amber' : 'red',
          ragCompliance: ragScore.reliability >= 80 ? 'green' : ragScore.reliability >= 60 ? 'amber' : 'red',
          ragPerformance: ragScore.performance >= 80 ? 'green' : ragScore.performance >= 60 ? 'amber' : 'red',
          ragSafety: ragScore.capabilities >= 80 ? 'green' : ragScore.capabilities >= 60 ? 'amber' : 'red',
          updatedAt: new Date(),
          updatedBy: 'rag-service'
        })
        .where(eq(contractors.id, contractorId));
    } catch (error) {
      log.error('Failed to update contractor RAG score:', { data: error }, 'scoreUpdater');
      throw error;
    }
  }

  /**
   * Bulk update RAG scores for multiple contractors
   */
  static async bulkUpdateRAGScores(
    ragScores: Array<{ contractorId: string; score: RAGScore }>
  ): Promise<{
    updated: number;
    failed: string[];
  }> {
    let updated = 0;
    const failed: string[] = [];

    // Process updates in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < ragScores.length; i += batchSize) {
      const batch = ragScores.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ contractorId, score }) => {
        try {
          await this.updateContractorRAGScore(contractorId, score);
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
    // In a production system, you would log to an audit table
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
}