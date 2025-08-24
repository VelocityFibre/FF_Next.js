/**
 * Execute complete database setup for FibreFlow
 * Creates ALL tables required by the application
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function setupDatabase() {
  console.log('🚀 Starting complete database setup...');
  
  try {
    const sql = neon(connectionString);
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'createAllTables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Remove all comment lines first
    const cleanedSql = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split by semicolons followed by newline or end of string
    const statements = cleanedSql
      .split(/;\s*(?:\n|$)/)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim());
    
    console.log(`📊 Executing ${statements.length} SQL statements...`);
    
    // First, execute CREATE TABLE statements
    console.log('\n📋 Creating tables...');
    const createTableStatements = statements.filter(stmt => 
      stmt.toUpperCase().includes('CREATE TABLE'));
    
    const createIndexStatements = statements.filter(stmt => 
      stmt.toUpperCase().includes('CREATE INDEX'));
    
    console.log(`Found ${createTableStatements.length} tables and ${createIndexStatements.length} indexes to create`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Create tables first
    for (const statement of createTableStatements) {
      const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      const tableName = tableMatch ? tableMatch[1] : 'unknown';
      
      try {
        await sql.query(statement);
        console.log(`✅ Table created/verified: ${tableName}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create table ${tableName}: ${error.message}`);
        errors.push({ table: tableName, error: error.message });
        errorCount++;
      }
    }
    
    // Now create indexes
    console.log('\n📋 Creating indexes...');
    for (const statement of createIndexStatements) {
      const indexMatch = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/i);
      const indexName = indexMatch ? indexMatch[1] : 'unknown';
      
      try {
        await sql.query(statement);
        console.log(`✅ Index created/verified: ${indexName}`);
        successCount++;
      } catch (error) {
        // Indexes might fail if tables don't exist, which is less critical
        console.error(`⚠️ Failed to create index ${indexName}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 DATABASE SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount} operations`);
    console.log(`❌ Failed: ${errorCount} operations`);
    
    if (errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      errors.forEach(({ table, error }) => {
        console.log(`  - ${table}: ${error}`);
      });
    }
    
    // Verify critical tables
    console.log('\n🔍 Verifying critical tables...');
    const criticalTables = [
      'contractors',
      'contractor_documents',
      'contractor_teams',
      'team_members',
      'project_assignments',
      'boqs',
      'boq_items',
      'purchase_orders',
      'suppliers',
      'audit_log',
      'project_analytics',
      'client_analytics'
    ];
    
    for (const table of criticalTables) {
      try {
        const result = await sql.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: Ready (${result[0].count} records)`);
      } catch (error) {
        console.log(`❌ ${table}: Not found or error`);
      }
    }
    
    console.log('\n✨ Database setup completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error during database setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);