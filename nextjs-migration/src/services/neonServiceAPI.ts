import { apiClient } from './api/config';

export interface NeonQueryResult<T = unknown> {
  success: boolean;
  data: T[];
  error?: string;
  rowCount?: number;
}

/**
 * Neon Database Service API Wrapper for Next.js
 * Routes all database queries through Next.js API endpoints
 */
export class NeonServiceAPI {

  /**
   * Execute a query through the API
   */
  async query<T = unknown>(queryText: string, params: unknown[] = []): Promise<NeonQueryResult<T>> {
    try {
      const result = await apiClient.post<NeonQueryResult<T>>('database/query', {
        query: queryText,
        params,
      });
      
      return {
        success: result.success,
        data: result.data || [],
        error: result.error,
        rowCount: result.rowCount || result.data?.length || 0,
      };
    } catch (error) {
      console.error('API query error:', error);
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
      const result = await apiClient.get<{ success: boolean }>('database/health');
      return result.success === true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get database version and basic info
   */
  async getInfo(): Promise<{ version?: string; connected: boolean; error?: string }> {
    try {
      const result = await apiClient.get<{
        success: boolean;
        version?: string;
        error?: string;
      }>('database/info');
      
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

// SOW-specific queries using Next.js API endpoints
export const sowQueries = {
  /**
   * Get all SOW data for a project
   */
  getProjectSOW: async (projectId: string) => {
    try {
      const result = await apiClient.get<{
        success: boolean;
        data: any;
        error?: string;
      }>(`sow/project/${projectId}`);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch SOW data');
      }

      return {
        success: true,
        data: result.data,
        errors: [],
      };
    } catch (error) {
      console.error('Failed to fetch project SOW:', error);
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
      const result = await apiClient.get<{
        success: boolean;
        data: any[];
        error?: string;
      }>(`sow/project/${projectId}/summary`);
      
      return {
        success: result.success,
        data: result.data || [],
        error: result.error,
      };
    } catch (error) {
      console.error('Failed to fetch project SOW summary:', error);
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
      const result = await apiClient.get<{
        success: boolean;
        data: any[];
        error?: string;
      }>(`sow/project/${projectId}/poles-with-drops`);
      
      return {
        success: result.success,
        data: result.data || [],
        error: result.error,
      };
    } catch (error) {
      console.error('Failed to fetch poles with drop count:', error);
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
      const result = await apiClient.get<{
        success: boolean;
        tables?: string[];
        error?: string;
      }>('sow/tables/check');
      
      return {
        success: result.success,
        data: result.tables || [],
        error: result.error,
      };
    } catch (error) {
      console.error('Failed to check SOW tables:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to check SOW tables',
      };
    }
  },

  /**
   * Import SOW data for a project
   */
  importSOWData: async (projectId: string, data: any) => {
    try {
      const result = await apiClient.post<{
        success: boolean;
        importId?: string;
        error?: string;
      }>(`sow/project/${projectId}/import`, data);
      
      return {
        success: result.success,
        importId: result.importId,
        error: result.error,
      };
    } catch (error) {
      console.error('Failed to import SOW data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import SOW data',
      };
    }
  },

  /**
   * Get import status
   */
  getImportStatus: async (importId: string) => {
    try {
      const result = await apiClient.get<{
        success: boolean;
        status: string;
        progress?: number;
        error?: string;
      }>(`sow/import/${importId}/status`);
      
      return result;
    } catch (error) {
      console.error('Failed to get import status:', error);
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get import status',
      };
    }
  },
};