import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
// Support both Vite (import.meta.env) and Node.js (process.env) environments
let databaseUrl: string | undefined;

// Try Vite environment variables first (browser/dev server)
try {
  databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL;
} catch (e) {
  // import.meta not available, likely in Node.js context
}

// Fallback to Node.js environment or hardcoded URL
if (!databaseUrl) {
  // Check if process is available (Node.js environment)
  if (typeof process !== 'undefined' && process.env) {
    databaseUrl = process.env.VITE_NEON_DATABASE_URL;
  }
  
  // Final fallback to hardcoded URL
  if (!databaseUrl) {
    databaseUrl = 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  }
}

if (!databaseUrl) {
  throw new Error('VITE_NEON_DATABASE_URL is not defined in environment variables');
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