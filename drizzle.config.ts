/**
 * Drizzle Kit Configuration for Neon Database
 * Manages migrations and database schema
 */

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/neon/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.VITE_NEON_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;