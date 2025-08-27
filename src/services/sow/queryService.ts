/**
 * SOW Query Service
 * Handles data retrieval and querying operations
 */

import { createNeonClient } from '@/lib/neon-sql';
import { getTableName } from './schema';
import { SOWData, SOWOperationResult } from './types';
import { log } from '@/lib/logger';

const { query } = createNeonClient(import.meta.env.VITE_NEON_DATABASE_URL || '');

/**
 * SOW data query service
 */
export class SOWQueryService {
  /**
   * Get all project SOW data from Neon database
   */
  static async getProjectSOWData(projectId: string): Promise<SOWOperationResult> {
    try {
      const polesTable = getTableName(projectId, 'poles');
      const dropsTable = getTableName(projectId, 'drops');
      const fibreTable = getTableName(projectId, 'fibre');

      // Query all data in parallel
      const [poles, drops, fibre, summary] = await Promise.all([
        query(`SELECT * FROM ${polesTable} ORDER BY pole_number`),
        query(`SELECT * FROM ${dropsTable} ORDER BY drop_number`),
        query(`SELECT * FROM ${fibreTable} ORDER BY segment_id`),
        query(`SELECT * FROM sow_project_summary WHERE project_id = $1`, [projectId])
      ]);

      const data: SOWData = {
        poles,
        drops,
        fibre,
        summary: summary[0] || null
      };

      return {
        success: true,
        data
      };
    } catch (error) {
      log.error('Error fetching SOW data from Neon:', { data: error }, 'queryService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          poles: [],
          drops: [],
          fibre: [],
          summary: null
        }
      };
    }
  }

  /**
   * Get poles data for a project
   */
  static async getProjectPoles(projectId: string) {
    try {
      const tableName = getTableName(projectId, 'poles');
      const poles = await query(`SELECT * FROM ${tableName} ORDER BY pole_number`);
      
      return {
        success: true,
        data: poles
      };
    } catch (error) {
      log.error('Error fetching poles data:', { data: error }, 'queryService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  /**
   * Get drops data for a project
   */
  static async getProjectDrops(projectId: string) {
    try {
      const tableName = getTableName(projectId, 'drops');
      const drops = await query(`SELECT * FROM ${tableName} ORDER BY drop_number`);
      
      return {
        success: true,
        data: drops
      };
    } catch (error) {
      log.error('Error fetching drops data:', { data: error }, 'queryService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  /**
   * Get fibre data for a project
   */
  static async getProjectFibre(projectId: string) {
    try {
      const tableName = getTableName(projectId, 'fibre');
      const fibre = await query(`SELECT * FROM ${tableName} ORDER BY segment_id`);
      
      return {
        success: true,
        data: fibre
      };
    } catch (error) {
      log.error('Error fetching fibre data:', { data: error }, 'queryService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  /**
   * Search poles by criteria
   */
  static async searchPoles(projectId: string, searchTerm: string) {
    try {
      const tableName = getTableName(projectId, 'poles');
      const poles = await query(`
        SELECT * FROM ${tableName} 
        WHERE pole_number ILIKE $1 
           OR address ILIKE $1 
           OR municipality ILIKE $1
           OR status ILIKE $1
        ORDER BY pole_number
      `, [`%${searchTerm}%`]);
      
      return {
        success: true,
        data: poles
      };
    } catch (error) {
      log.error('Error searching poles:', { data: error }, 'queryService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  /**
   * Search drops by criteria
   */
  static async searchDrops(projectId: string, searchTerm: string) {
    try {
      const tableName = getTableName(projectId, 'drops');
      const drops = await query(`
        SELECT * FROM ${tableName} 
        WHERE drop_number ILIKE $1 
           OR pole_number ILIKE $1
           OR cable_type ILIKE $1
           OR address ILIKE $1
        ORDER BY drop_number
      `, [`%${searchTerm}%`]);
      
      return {
        success: true,
        data: drops
      };
    } catch (error) {
      log.error('Error searching drops:', { data: error }, 'queryService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }
}