import { log } from '@/lib/logger';

export interface NeonQueryResult<T = unknown> {
  success: boolean;
  data: T[];
  error?: string;
  rowCount?: number;
}

/**
 * Neon Database Service API Wrapper
 * Routes all database queries through API endpoints instead of direct connections
 */
export class NeonServiceAPI {
  private apiBase = '/api';

  /**
   * Execute a query through the API
   */
  async query<T = unknown>(queryText: string, params: unknown[] = []): Promise<NeonQueryResult<T>> {
    try {
      const response = await fetch(`${this.apiBase}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText, params }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        data: result.data || [],
        error: result.error,
        rowCount: result.rowCount || result.data?.length || 0,
      };
    } catch (error) {
      log.error('API query error', { error, query: queryText }, 'neonServiceAPI');
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown API error',
      };
    }
  }

  /**
   * Execute a non-SELECT query (INSERT, UPDATE, DELETE)
   */
  async execute(queryText: string, params: unknown[] = []): Promise<NeonQueryResult> {
    return this.query(queryText, params);
  }

  /**
   * Check if database connection is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      log.error('Health check failed', { error }, 'neonServiceAPI');
      return false;
    }
  }

  /**
   * Get database version and basic info
   */
  async getInfo(): Promise<{ version?: string; connected: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      const result = await response.json();
      return {
        connected: result.success === true,
        version: result.version || 'Unknown',
        error: result.error,
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

// Export singleton instance
export const neonService = new NeonServiceAPI();

// SOW-specific queries using API endpoints
export const sowQueries = {
  /**
   * Get all SOW data for a project
   */
  getProjectSOW: async (projectId: string) => {
    try {
      const response = await fetch(`/api/sow?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch SOW data: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch SOW data');
      }

      return {
        success: true,
        data: result.data,
        errors: [],
      };
    } catch (error) {
      log.error('Failed to fetch project SOW', { error, projectId }, 'sowQueries');
      return {
        success: false,
        data: { poles: [], drops: [], fibre: [], summary: { totalPoles: 0, totalDrops: 0, totalFibre: 0 } },
        error: error instanceof Error ? error.message : 'Failed to fetch SOW data',
      };
    }
  },

  /**
   * Get SOW summary statistics for a project
   */
  getProjectSOWSummary: async (projectId: string) => {
    try {
      const response = await fetch(`/api/sow/summary?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch SOW summary: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: result.success,
        data: result.data || [],
        error: result.error,
      };
    } catch (error) {
      log.error('Failed to fetch project SOW summary', { error, projectId }, 'sowQueries');
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch SOW summary',
      };
    }
  },

  /**
   * Get poles with their connected drops count
   */
  getPolesWithDropCount: async (projectId: string) => {
    try {
      const response = await fetch(`/api/sow/poles?projectId=${projectId}&includeDropCount=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch poles with drop count: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: result.success,
        data: result.data || [],
        error: result.error,
      };
    } catch (error) {
      log.error('Failed to fetch poles with drop count', { error, projectId }, 'sowQueries');
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch poles with drop count',
      };
    }
  },

  /**
   * Check if SOW tables exist
   */
  checkSOWTables: async () => {
    try {
      const response = await fetch('/api/sow/health');
      if (!response.ok) {
        throw new Error(`Failed to check SOW tables: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: result.success,
        data: result.tables || [],
        error: result.error,
      };
    } catch (error) {
      log.error('Failed to check SOW tables', { error }, 'sowQueries');
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to check SOW tables',
      };
    }
  },
};