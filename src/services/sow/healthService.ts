/**
 * SOW Health Service
 * Routes all database operations through API endpoints
 */

import { sowApi } from '@/services/api/sowApi';
import { log } from '@/lib/logger';

/**
 * SOW database health service
 */
export class SOWHealthService {
  /**
   * Check SOW service health via API
   */
  static async checkHealth() {
    try {
      const result = await sowApi.checkHealth();
      return { 
        connected: result.success === true, 
        timestamp: result.timestamp || new Date().toISOString()
      };
    } catch (error) {
      log.error('SOW health check failed:', { data: error }, 'healthService');
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if project tables exist via API
   */
  static async checkProjectTables(projectId: string) {
    try {
      // Initialize tables if needed - API will check if they exist
      const result = await sowApi.initializeTables(projectId);
      
      const tables = result.tables || [];
      const tableResults = tables.map((tableName: string) => ({
        table: tableName,
        exists: true
      }));

      return {
        success: result.success === true,
        tables: tableResults
      };
    } catch (error) {
      log.error('Error checking project tables:', { data: error }, 'healthService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tables: []
      };
    }
  }

  /**
   * Get database statistics for a project via API
   */
  static async getProjectStats(projectId: string) {
    try {
      // Get SOW data to calculate stats
      const result = await sowApi.getProjectSOWData(projectId);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch project data');
      }

      const { poles = [], drops = [], fibre = [] } = result.data;

      return {
        success: true,
        stats: {
          poles: { count: poles.length, size: 'N/A' },
          drops: { count: drops.length, size: 'N/A' },
          fibre: { count: fibre.length, size: 'N/A' }
        }
      };
    } catch (error) {
      log.error('Error getting project stats:', { data: error }, 'healthService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: {
          poles: { count: 0, size: '0 bytes' },
          drops: { count: 0, size: '0 bytes' },
          fibre: { count: 0, size: '0 bytes' }
        }
      };
    }
  }
}