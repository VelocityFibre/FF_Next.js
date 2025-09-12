/**
 * Lazy-loaded Neon SQL client for Next.js
 * Prevents immediate DATABASE_URL access on client-side
 */

import { neon } from '@neondatabase/serverless';

// Lazy initialization to prevent connection attempts in browser
let sqlInstance: ReturnType<typeof neon> | null = null;

/**
 * Get the Neon SQL client with lazy initialization
 * This prevents immediate DATABASE_URL access on module import
 */
export function getSql(): ReturnType<typeof neon> {
  if (sqlInstance) {
    return sqlInstance;
  }

  // Check if we're in the browser
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // In browser, return a dummy client that throws informative errors
    // This prevents DATABASE_URL access on client side
    const dummySql = ((strings: TemplateStringsArray, ...values: any[]) => {
      throw new Error('Database operations cannot be performed in the browser. Use API routes instead.');
    }) as any as ReturnType<typeof neon>;
    
    dummySql.transaction = async (callback: any) => {
      throw new Error('Database transactions cannot be performed in the browser. Use API routes instead.');
    };
    
    sqlInstance = dummySql;
    return sqlInstance;
  }

  // Server-side: get DATABASE_URL safely
  let databaseUrl: string | undefined;

  // Try Vite environment variable first (for server-side build)
  if (process.env?.NEXT_PUBLIC_DATABASE_URL) {
    databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
  }
  // Fall back to Node.js environment variables (server-side)
  else if (typeof process !== 'undefined' && process.env) {
    databaseUrl = process.env.DATABASE_URL;
  }

  // No fallback - environment variable is required for security
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required and not defined. Check your .env file.');
  }

  sqlInstance = neon(databaseUrl);
  return sqlInstance;
}

/**
 * Convenience export for lazy SQL access
 * Use this instead of importing sql directly
 */
export const sql = getSql();
