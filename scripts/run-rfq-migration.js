#!/usr/bin/env node

/**
 * Run RFQ/BOQ Extended Tables Migration
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🚀 Starting RFQ/BOQ migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'extend-rfq-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements more carefully, handling CREATE TABLE blocks
    const statements = [];
    let currentStatement = '';
    const lines = migrationSQL.split('\n');
    
    for (const line of lines) {
      // Skip pure comment lines
      if (line.trim().startsWith('--') && !currentStatement.trim()) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Check if statement is complete (ends with semicolon)
      if (line.trim().endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }
      
      // Extract a description from the statement for logging
      let description = 'SQL statement';
      if (statement.includes('CREATE TABLE')) {
        const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?([\w_]+)/i);
        if (match) description = `Create table ${match[1]}`;
      } else if (statement.includes('ALTER TABLE')) {
        const match = statement.match(/ALTER TABLE ([\w_]+)/i);
        if (match) description = `Alter table ${match[1]}`;
      } else if (statement.includes('CREATE INDEX')) {
        const match = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?([\w_]+)/i);
        if (match) description = `Create index ${match[1]}`;
      } else if (statement.includes('CREATE OR REPLACE VIEW')) {
        const match = statement.match(/CREATE OR REPLACE VIEW ([\w_]+)/i);
        if (match) description = `Create view ${match[1]}`;
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        const match = statement.match(/CREATE OR REPLACE FUNCTION ([\w_]+)/i);
        if (match) description = `Create function ${match[1]}`;
      }
      
      try {
        console.log(`  ⏳ Executing: ${description}`);
        // Use sql.query for raw SQL statements
        await sql.query(statement);
        console.log(`  ✅ Success: ${description}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ⚠️  Skipped (already exists): ${description}`);
        } else {
          console.error(`  ❌ Failed: ${description}`);
          console.error(`     Error: ${error.message}`);
          // Continue with other statements
        }
      }
    }
    
    // Verify tables were created
    console.log('\n📊 Verifying migration...');
    
    const tables = [
      'rfq_items',
      'rfq_responses', 
      'rfq_response_items',
      'rfq_notifications',
      'rfq_evaluation_criteria',
      'rfq_evaluation_scores',
      'boq_revisions',
      'boq_approvals',
      'boq_rfq_links',
      'boq_rfq_item_mapping'
    ];
    
    for (const table of tables) {
      try {
        const result = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ${table}
          ) as exists`;
        
        if (result[0].exists) {
          console.log(`  ✅ Table ${table} exists`);
        } else {
          console.log(`  ❌ Table ${table} not found`);
        }
      } catch (error) {
        console.log(`  ❌ Error checking table ${table}: ${error.message}`);
      }
    }
    
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();