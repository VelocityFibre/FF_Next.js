import { neon } from '@neondatabase/serverless';

// Neon connection configuration
const connectionString = import.meta.env.VITE_NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!connectionString) {
  // Neon database URL not configured. SOW features will not work.
}

// Create SQL query function
const sql = connectionString ? neon(connectionString) : null;

export interface NeonQueryResult<T = unknown> {
  success: boolean;
  data: T[];
  error?: string;
  rowCount?: number;
}

/**
 * Neon Database Service for SOW Data
 * Handles direct SQL queries to Neon PostgreSQL database
 */
export class NeonService {
  
  /**
   * Execute a SQL query (for queries without parameters, use template literals)
   */
  async query<T = unknown>(queryText: string, params: unknown[] = []): Promise<NeonQueryResult<T>> {
    if (!sql) {
      return {
        success: false,
        data: [],
        error: 'Neon database not configured'
      };
    }

    try {
      // Executing Neon query
      
      let result;
      if (params.length === 0) {
        // No parameters, create template literal manually
        const templateArray = [queryText];
        (templateArray as any).raw = [queryText];
        result = await (sql as any)(templateArray);
      } else {
        // Use sql.query for parameterized queries
        // Note: This might not be available in the serverless version
        // If it fails, we'll fall back to template construction
        try {
          if ((sql as any).query) {
            result = await (sql as any).query(queryText, params);
          } else {
            throw new Error('Parameterized queries not supported in this version');
          }
        } catch (paramError) {
          // Fall back to safe parameter injection
          let processedQuery = queryText;
          params.forEach((param, index) => {
            // Escape single quotes to prevent SQL injection
            const safeParam = typeof param === 'string' 
              ? param.replace(/'/g, "''") 
              : String(param);
            processedQuery = processedQuery.replace(`$${index + 1}`, `'${safeParam}'`);
          });
          const templateArray = [processedQuery];
          (templateArray as any).raw = [processedQuery];
          result = await (sql as any)(templateArray);
        }
      }
      
      return {
        success: true,
        data: result as T[],
        rowCount: result.length
      };
    } catch (error) {
      // Query error occurred
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  /**
   * Execute a non-SELECT query (INSERT, UPDATE, DELETE)
   */
  async execute(queryText: string, params: unknown[] = []): Promise<NeonQueryResult> {
    // For execute operations, we can reuse the query method
    return this.query(queryText, params);
  }

  /**
   * Check if database connection is available
   */
  async healthCheck(): Promise<boolean> {
    if (!sql) return false;
    
    try {
      const result = await this.query('SELECT 1 as health');
      return result.success;
    } catch (error) {
      // Health check failed
      return false;
    }
  }

  /**
   * Get database version and basic info
   */
  async getInfo(): Promise<{ version?: string; connected: boolean; error?: string }> {
    if (!sql) {
      return { connected: false, error: 'Database not configured' };
    }

    try {
      const result = await this.query('SELECT version() as version');
      if (result.success && result.data.length > 0) {
        return {
          connected: true,
          version: (result.data[0] as any)?.version || 'Unknown'
        };
      } else {
        return {
          connected: false,
          error: result.error || 'No data returned'
        };
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}

// Export singleton instance
export const neonService = new NeonService();

// SOW-specific queries
export const sowQueries = {
  
  /**
   * Get all SOW data for a project
   */
  getProjectSOW: async (projectId: string) => {
    const queries = [
      neonService.query('SELECT * FROM sow_poles WHERE project_id = $1 ORDER BY id', [projectId]),
      neonService.query('SELECT * FROM sow_drops WHERE project_id = $1 ORDER BY id', [projectId]),
      neonService.query('SELECT * FROM sow_fibre WHERE project_id = $1 ORDER BY id', [projectId])
    ];

    try {
      const [polesResult, dropsResult, fibreResult] = await Promise.all(queries);
      
      return {
        success: true,
        data: {
          poles: polesResult.success ? polesResult.data : [],
          drops: dropsResult.success ? dropsResult.data : [],
          fibre: fibreResult.success ? fibreResult.data : [],
          summary: {
            totalPoles: polesResult.success ? polesResult.data.length : 0,
            totalDrops: dropsResult.success ? dropsResult.data.length : 0,
            totalFibre: fibreResult.success ? fibreResult.data.length : 0
          }
        },
        errors: [
          ...(polesResult.success ? [] : [`Poles: ${polesResult.error}`]),
          ...(dropsResult.success ? [] : [`Drops: ${dropsResult.error}`]),
          ...(fibreResult.success ? [] : [`Fibre: ${fibreResult.error}`])
        ]
      };
    } catch (error) {
      return {
        success: false,
        data: { poles: [], drops: [], fibre: [], summary: { totalPoles: 0, totalDrops: 0, totalFibre: 0 } },
        error: error instanceof Error ? error.message : 'Failed to fetch SOW data'
      };
    }
  },

  /**
   * Get SOW summary statistics for a project
   */
  getProjectSOWSummary: async (projectId: string) => {
    const query = `
      SELECT 
        'poles' as type,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM sow_poles WHERE project_id = $1
      UNION ALL
      SELECT 
        'drops' as type,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned
      FROM sow_drops WHERE project_id = $1
      UNION ALL
      SELECT 
        'fibre' as type,
        COUNT(*) as total,
        COALESCE(SUM(distance), 0) as total_distance,
        COUNT(CASE WHEN status = 'installed' THEN 1 END) as installed
      FROM sow_fibre WHERE project_id = $1
    `;

    return neonService.query(query, [projectId]);
  },

  /**
   * Get poles with their connected drops count
   */
  getPolesWithDropCount: async (projectId: string) => {
    const query = `
      SELECT 
        p.*,
        COUNT(d.id) as connected_drops,
        ARRAY_AGG(d.drop_number) FILTER (WHERE d.drop_number IS NOT NULL) as drop_numbers
      FROM sow_poles p
      LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
      WHERE p.project_id = $1
      GROUP BY p.id, p.pole_number, p.project_id, p.latitude, p.longitude, p.status, p.created_at, p.updated_at
      ORDER BY p.pole_number
    `;

    return neonService.query(query, [projectId]);
  },

  /**
   * Check if SOW tables exist
   */
  checkSOWTables: async () => {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sow_poles', 'sow_drops', 'sow_fibre')
    `;

    return neonService.query(query);
  }
};