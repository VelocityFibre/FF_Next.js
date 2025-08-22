import { neon } from '@neondatabase/serverless';

// Create a wrapper function for dynamic SQL queries
export function createNeonClient(databaseUrl: string) {
  const sql = neon(databaseUrl);
  
  return {
    // For template literal queries
    sql,
    
    // For dynamic queries with string concatenation
    query: async (queryString: string, params?: any[]) => {
      // Use the sql function as a regular function
      return (sql as any)(queryString, params);
    }
  };
}