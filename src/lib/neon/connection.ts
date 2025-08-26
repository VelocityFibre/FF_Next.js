/**
 * Neon Database Connection Setup
 * Drizzle ORM with Neon Serverless PostgreSQL
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { neonTables } from './schema';

// Get Neon connection string from environment
const neonUrl = import.meta.env.VITE_NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!neonUrl) {
  throw new Error('VITE_NEON_DATABASE_URL environment variable is required');
}

// Create Neon client
const sql = neon(neonUrl);

// Create Drizzle instance
export const neonDb = drizzle(sql, { schema: neonTables });

// Alias for backward compatibility
export const db = neonDb;

// Connection test utility
export async function testNeonConnection(): Promise<boolean> {
  try {
    await sql`SELECT NOW() as current_time`;

    return true;
  } catch (error) {
    console.error('Neon connection failed:', error);
    return false;
  }
}

// Database utilities
export const neonUtils = {
  /**
   * Test database connection
   */
  async ping(): Promise<{ success: boolean; timestamp?: string; error?: string }> {
    try {
      const result = await sql`SELECT NOW() as timestamp`;
      return {
        success: true,
        timestamp: result[0].timestamp,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Get database version and info
   */
  async getInfo(): Promise<any> {
    try {
      const versionResult = await sql`SELECT VERSION() as version`;
      const sizeResult = await sql`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as database_size,
          current_database() as database_name,
          current_user as user_name
      `;
      
      return {
        version: versionResult[0].version,
        ...sizeResult[0],
      };
    } catch (error) {
      console.error('Failed to get database info:', error);
      return null;
    }
  },

  /**
   * Get table information
   */
  async getTableStats(): Promise<any> {
    try {
      const result = await sql`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        ORDER BY tablename;
      `;
      
      return result;
    } catch (error) {
      console.error('Failed to get table stats:', error);
      return [];
    }
  },

  /**
   * Execute raw SQL (use with caution)
   */
  async rawQuery(query: string, params: any[] = []): Promise<any> {
    try {
      // Note: For Neon, we should use template literals instead of parameterized queries
      // This is a basic implementation - consider using Drizzle for type safety
      return await sql([query] as any, ...params);
    } catch (error) {
      console.error('Raw query failed:', error);
      throw error;
    }
  },
};