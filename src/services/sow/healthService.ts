/**
 * SOW Health Service
 * Handles database health checks and connection monitoring
 */

import { createNeonClient } from '@/lib/neon-sql';
import { log } from '@/lib/logger';

const { sql, query } = createNeonClient(import.meta.env.VITE_NEON_DATABASE_URL || '');

/**
 * SOW database health service
 */
export class SOWHealthService {
  /**
   * Check Neon database connection health
   */
  static async checkHealth() {
    try {
      const result = await sql`SELECT NOW() as current_time`;
      return { 
        connected: true, 
        timestamp: result[0].current_time 
      };
    } catch (error) {
      log.error('Neon health check failed:', { data: error }, 'healthService');
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if project tables exist
   */
  static async checkProjectTables(projectId: string) {
    try {
      const safeProjectId = projectId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const tableNames = [
        `sow_poles_${safeProjectId}`,
        `sow_drops_${safeProjectId}`,
        `sow_fibre_${safeProjectId}`
      ];

      const results = await Promise.all(
        tableNames.map(async (tableName) => {
          try {
            await query(`SELECT 1 FROM ${tableName} LIMIT 1`);
            return { table: tableName, exists: true };
          } catch (error) {
            return { table: tableName, exists: false };
          }
        })
      );

      return {
        success: true,
        tables: results
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
   * Get database statistics for a project
   */
  static async getProjectStats(projectId: string) {
    try {
      const safeProjectId = projectId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const polesTable = `sow_poles_${safeProjectId}`;
      const dropsTable = `sow_drops_${safeProjectId}`;
      const fibreTable = `sow_fibre_${safeProjectId}`;

      const stats = await Promise.all([
        query(`SELECT COUNT(*) as count, pg_size_pretty(pg_total_relation_size('${polesTable}')) as size FROM ${polesTable}`).catch(() => ({ count: 0, size: '0 bytes' })),
        query(`SELECT COUNT(*) as count, pg_size_pretty(pg_total_relation_size('${dropsTable}')) as size FROM ${dropsTable}`).catch(() => ({ count: 0, size: '0 bytes' })),
        query(`SELECT COUNT(*) as count, pg_size_pretty(pg_total_relation_size('${fibreTable}')) as size FROM ${fibreTable}`).catch(() => ({ count: 0, size: '0 bytes' }))
      ]);

      return {
        success: true,
        stats: {
          poles: stats[0][0] || { count: 0, size: '0 bytes' },
          drops: stats[1][0] || { count: 0, size: '0 bytes' },
          fibre: stats[2][0] || { count: 0, size: '0 bytes' }
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