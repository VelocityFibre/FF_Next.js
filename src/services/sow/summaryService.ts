/**
 * SOW Summary Service
 * Handles project summary calculations and updates
 */

import { createNeonClient } from '@/lib/neon-sql';
import { getTableName } from './schema';
import { log } from '@/lib/logger';

const { query } = createNeonClient(import.meta.env.VITE_NEON_DATABASE_URL || '');

/**
 * SOW project summary service
 */
export class SOWSummaryService {
  /**
   * Update project summary with current counts and totals
   */
  static async updateProjectSummary(projectId: string): Promise<{ success: boolean; error?: any }> {
    try {
      const polesTable = getTableName(projectId, 'poles');
      const dropsTable = getTableName(projectId, 'drops');
      const fibreTable = getTableName(projectId, 'fibre');

      // Get counts from each table
      const [polesCount, dropsCount, fibreCount] = await Promise.all([
        query(`SELECT COUNT(*) as count FROM ${polesTable}`),
        query(`SELECT COUNT(*) as count FROM ${dropsTable}`),
        query(`SELECT COUNT(*) as count, SUM(length) as total_length FROM ${fibreTable}`)
      ]);

      // Update or insert summary
      await query(`
        INSERT INTO sow_project_summary (
          project_id, total_poles, total_drops, total_fibre_segments, total_fibre_length
        ) VALUES (
          $1, $2, $3, $4, $5
        )
        ON CONFLICT (project_id) DO UPDATE SET
          total_poles = EXCLUDED.total_poles,
          total_drops = EXCLUDED.total_drops,
          total_fibre_segments = EXCLUDED.total_fibre_segments,
          total_fibre_length = EXCLUDED.total_fibre_length,
          last_updated = CURRENT_TIMESTAMP
      `, [
        projectId, 
        polesCount[0].count, 
        dropsCount[0].count, 
        fibreCount[0].count,
        fibreCount[0].total_length || 0
      ]);

      return { success: true };
    } catch (error) {
      log.error('Error updating project summary:', { data: error }, 'summaryService');
      // Non-critical error, don't throw
      return { success: false, error };
    }
  }

  /**
   * Get project summary data
   */
  static async getProjectSummary(projectId: string) {
    try {
      const result = await query(`
        SELECT * FROM sow_project_summary 
        WHERE project_id = $1
      `, [projectId]);

      return {
        success: true,
        data: result[0] || null
      };
    } catch (error) {
      log.error('Error fetching project summary:', { data: error }, 'summaryService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Get all project summaries
   */
  static async getAllProjectSummaries() {
    try {
      const results = await query(`
        SELECT * FROM sow_project_summary 
        ORDER BY last_updated DESC
      `);

      return {
        success: true,
        data: results
      };
    } catch (error) {
      log.error('Error fetching all project summaries:', { data: error }, 'summaryService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }
}