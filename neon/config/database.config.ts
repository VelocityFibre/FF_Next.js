/**
 * Neon Database Configuration
 * Central configuration for all Neon database connections
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: join(__dirname, '../../.env') });

// Database connection string
const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not configured');
  console.log('Please add your Neon database connection string to the .env file:');
  console.log('DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require');
  throw new Error('Database connection string is required');
}

// Create Neon SQL client
export const sql = neon(DATABASE_URL);

// Create Drizzle ORM instance
export const db = drizzle(sql);

// Database configuration
export const dbConfig = {
  connectionString: DATABASE_URL,
  ssl: true,
  poolSize: 10,
  maxConnections: 20,
  idleTimeout: 30000,
  connectionTimeout: 10000,
};

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT current_database(), current_user, version()`;
    console.log('✅ Database connection successful');
    console.log('Database:', result[0].current_database);
    console.log('User:', result[0].current_user);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default {
  sql,
  db,
  dbConfig,
  testConnection
};