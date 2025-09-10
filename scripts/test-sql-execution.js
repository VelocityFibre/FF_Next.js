#!/usr/bin/env node

/**
 * Test SQL Execution - Directly execute OneMap table creation
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function testSqlExecution() {
  console.log('🔍 Testing Direct SQL Execution...\n');

  try {
    const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('No database connection string found');
    }

    const sql = neon(connectionString);

    // Test basic connection
    console.log('📊 Testing database connection...');
    const testResult = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'create-onemap-tracking-tables.sql');
    console.log('📄 Reading migration file...');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    console.log('✅ Migration file read successfully\n');

    // Split the SQL into individual statements
    console.log('🔧 Processing SQL statements...');
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement individually with detailed logging
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`  Executing statement ${i + 1}/${statements.length}...`);
          console.log(`    SQL: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);

          await sql.unsafe(statement);

          console.log(`    ✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.log(`    ❌ Statement ${i + 1} failed: ${error.message}`);
          // Continue with other statements
        }
      }
    }

    console.log('\n🔍 Verifying table creation...');

    // Check if tables were created
    const tablesToCheck = [
      'onemap_imports',
      'onemap_import_batches',
      'onemap_change_history',
      'onemap_import_reports',
      'onemap_first_instances'
    ];

    let createdCount = 0;
    for (const table of tablesToCheck) {
      try {
        const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
        console.log(`   ✅ ${table} - Created (${result[0].count} records)`);
        createdCount++;
      } catch (error) {
        console.log(`   ❌ ${table} - NOT FOUND: ${error.message}`);
      }
    }

    console.log(`\n📈 Result: ${createdCount}/${tablesToCheck.length} tables created successfully`);

    if (createdCount === tablesToCheck.length) {
      console.log('\n🎯 SUCCESS: All OneMap tables created successfully!');
    } else {
      console.log('\n⚠️  WARNING: Some tables were not created');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testSqlExecution().catch(console.error);
}

module.exports = { testSqlExecution };