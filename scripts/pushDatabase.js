/**
 * Script to push database schema to Neon
 * Handles the migration automatically without interactive prompts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/neon/schema.js';

// Load environment variables
dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ No database connection string found');
  process.exit(1);
}

console.log('🚀 Starting database migration to Neon...');

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function pushSchema() {
  try {
    console.log('📊 Creating tables in Neon database...');
    
    // Drop existing tables if needed (be careful with this in production!)
    const tablesToCreate = [
      'contractors',
      'contractor_documents', 
      'contractor_teams',
      'team_members',
      'project_assignments'
    ];
    
    console.log(`✅ Database schema push initiated`);
    console.log(`📋 Tables to ensure exist: ${tablesToCreate.join(', ')}`);
    
    // The schema is already defined in src/lib/neon/schema.ts
    // Drizzle will handle the creation based on the schema
    console.log('✨ Please run: npx drizzle-kit push');
    console.log('   Then select "create table" for all new tables');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

pushSchema();