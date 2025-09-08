import { sql } from '@/lib/db';

// Legacy-compatible factory that now returns the canonical client.
// The databaseUrl parameter is ignored to enforce a single source of truth.
export function createNeonClient(_databaseUrl?: string) {
  const client = sql as any;
  return {
    // For template literal queries
    sql: client,

    // For dynamic queries with string concatenation
    query: async (queryString: string, params?: any[]) => {
      return client(queryString, params);
    },
  };
}

export { sql };