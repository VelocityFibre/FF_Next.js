import { neon } from '@neondatabase/serverless';

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Get the database URL from environment variables
let databaseUrl: string | undefined;

// Only use database in server/build time, not in browser
if (!isBrowser) {
  // Try Vite environment variable first (for client-side build)
  if (import.meta.env?.VITE_DATABASE_URL) {
    databaseUrl = import.meta.env.VITE_DATABASE_URL;
  }
  // Fall back to Node.js environment variables (server-side)
  else if (typeof process !== 'undefined' && process.env) {
    databaseUrl = process.env.DATABASE_URL;
  }
} else {
  // In browser, use a dummy URL to prevent errors
  // Real database access should go through API routes
  databaseUrl = 'postgresql://dummy@localhost/dummy';
}

// No fallback - environment variable is required for security
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required and not defined. Check your .env file.');
}

// Create the Neon SQL function with warning disabled for browser
export const sql = neon(databaseUrl, {
  // Disable the security warning in browser since we'll use API routes
  // @ts-ignore
  disableWarningInBrowsers: true
});

// Helper function for transactions
export async function transaction<T>(
  callback: (sqlClient: typeof sql) => Promise<T>
): Promise<T> {
  try {
    await sql`BEGIN`;
    const result = await callback(sql);
    await sql`COMMIT`;
    return result;
  } catch (error) {
    await sql`ROLLBACK`;
    throw error;
  }
}