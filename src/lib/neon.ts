import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
let databaseUrl: string | undefined;

// Try Vite environment variable first (for client-side)
if (import.meta.env?.VITE_DATABASE_URL) {
  databaseUrl = import.meta.env.VITE_DATABASE_URL;
}
// Fall back to Node.js environment variables (server-side)
else if (typeof process !== 'undefined' && process.env) {
  databaseUrl = process.env.DATABASE_URL;
}

// No fallback - environment variable is required for security
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required and not defined. Check your .env file.');
}

// Create the Neon SQL function
export const sql = neon(databaseUrl);

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