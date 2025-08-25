/**
 * Drizzle Kit Configuration for Neon Database
 * Manages migrations and database schema
 */

import type { Config } from 'drizzle-kit';

// Get connection string from environment variable
const connectionString = process.env.DATABASE_URL || (() => {
  console.error('WARNING: DATABASE_URL environment variable not set');
  throw new Error('DATABASE_URL environment variable is required');
})();

export default {
  schema: [
    './src/lib/neon/schema/*.schema.ts',
    './src/lib/neon/schema/procurement/*.schema.ts',
    './src/lib/neon/schema/procurement/rfq/*.schema.ts',
    './src/lib/neon/schema/analytics/*.schema.ts'
  ],
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
} satisfies Config;