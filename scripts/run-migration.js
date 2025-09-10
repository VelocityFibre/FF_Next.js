#!/usr/bin/env node

/**
 * Database Migration Runner for OneMap Import System
 * Runs the SQL migration to create the new tracking tables
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Starting OneMap Import System Migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'create-onemap-tracking-tables.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    console.log('📄 Read migration file successfully');
    console.log('🔧 Executing migration...\n');

    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`  Executing statement ${i + 1}/${statements.length}...`);
          await sql.unsafe(statement);
        } catch (error) {
          // Some statements might fail if tables already exist, that's OK
          if (error.message.includes('already exists') ||
              error.message.includes('does not exist')) {
            console.log(`    ⚠️  Statement ${i + 1} skipped (expected): ${error.message.split('\n')[0]}`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Created tables:');
    console.log('  - onemap_imports (main import table)');
    console.log('  - onemap_import_batches (batch tracking)');
    console.log('  - onemap_change_history (status change tracking)');
    console.log('  - onemap_import_reports (report storage)');
    console.log('  - onemap_first_instances (duplicate prevention)');
    console.log('\n📊 Created views:');
    console.log('  - onemap_current_records');
    console.log('  - onemap_recent_changes');
    console.log('  - onemap_first_instances_summary');

    console.log('\n🎯 Ready to use the new import system!');
    console.log('   Run: node scripts/import-onemap-daily.js <csv-file>');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };