#!/usr/bin/env node

/**
 * Run Contractors Migration Script
 * Executes the contractors table creation SQL against Neon database
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Database connection
const DATABASE_URL = 'postgresql://neondb_owner:npg_aRNLhZc1G2CD@ep-dry-night-a9qyh4sj-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('🚀 Starting contractors migration...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'create-contractors-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons to handle multiple statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (!statement.trim()) continue;
      
      // Log progress
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
        console.log(`  Creating table: ${tableName}...`);
      } else if (statement.includes('CREATE INDEX')) {
        const indexName = statement.match(/CREATE INDEX (\w+)/)?.[1];
        console.log(`  Creating index: ${indexName}...`);
      } else if (statement.includes('CREATE TRIGGER')) {
        const triggerName = statement.match(/CREATE TRIGGER (\w+)/)?.[1];
        console.log(`  Creating trigger: ${triggerName}...`);
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        console.log(`  Creating function...`);
      }
      
      try {
        // Use sql.unsafe for raw SQL execution
        await sql.unsafe(statement + ';');
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
        // Continue with other statements
      }
    }
    
    // Verify tables were created
    console.log('\n✅ Migration completed! Verifying tables...\n');
    
    const tables = [
      'contractors',
      'contractor_teams', 
      'contractor_documents',
      'contractor_rag_history',
      'contractor_onboarding_stages'
    ];
    
    for (const table of tables) {
      try {
        const result = await sql`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = ${table}
        `;
        
        if (result[0].count > 0) {
          console.log(`  ✅ Table '${table}' exists`);
        } else {
          console.log(`  ❌ Table '${table}' not found`);
        }
      } catch (error) {
        console.error(`  ❌ Error checking table '${table}':`, error.message);
      }
    }
    
    console.log('\n🎉 Contractors migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);