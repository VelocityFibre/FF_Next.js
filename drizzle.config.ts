/**
 * Drizzle Kit Configuration for Neon Database
 * Manages migrations and database schema
 */

import type { Config } from 'drizzle-kit';

// Hardcoded connection string for now (will be replaced with env var in production)
const connectionString = 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export default {
  schema: './src/lib/neon/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
} satisfies Config;