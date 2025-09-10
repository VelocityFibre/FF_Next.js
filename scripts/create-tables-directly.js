#!/usr/bin/env node

/**
 * Create Tables Directly - Execute the CREATE TABLE statements manually
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function createTablesDirectly() {
  console.log('🔍 Creating OneMap Tables Directly...\n');

  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('No database connection string found');
    }

    const sql = neon(connectionString);

    console.log('📊 Creating tables one by one...\n');

    // Create main import table
    console.log('1. Creating onemap_imports table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS onemap_imports (
        id SERIAL PRIMARY KEY,
        property_id VARCHAR(50) UNIQUE NOT NULL,
        tracking_key VARCHAR(255) NOT NULL,
        current_data JSONB NOT NULL,
        import_batch_id VARCHAR(100) NOT NULL,
        first_seen_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        version INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('   ✅ onemap_imports created\n');

    // Create import batch tracking table
    console.log('2. Creating onemap_import_batches table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS onemap_import_batches (
        id SERIAL PRIMARY KEY,
        batch_id VARCHAR(100) UNIQUE NOT NULL,
        import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        file_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'processing',
        total_rows_processed INTEGER DEFAULT 0,
        new_records_count INTEGER DEFAULT 0,
        duplicate_count INTEGER DEFAULT 0,
        verification_passed BOOLEAN DEFAULT false,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('   ✅ onemap_import_batches created\n');

    // Create change history table
    console.log('3. Creating onemap_change_history table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS onemap_change_history (
        id SERIAL PRIMARY KEY,
        property_id VARCHAR(50) NOT NULL,
        batch_id VARCHAR(100) NOT NULL,
        change_type VARCHAR(50) NOT NULL,
        change_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        record_snapshot JSONB,
        previous_data JSONB,
        is_first_instance BOOLEAN DEFAULT false,
        change_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('   ✅ onemap_change_history created\n');

    // Create import reports table
    console.log('4. Creating onemap_import_reports table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS onemap_import_reports (
        id SERIAL PRIMARY KEY,
        batch_id VARCHAR(100) NOT NULL,
        report_type VARCHAR(100) NOT NULL,
        report_data JSONB NOT NULL,
        created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('   ✅ onemap_import_reports created\n');

    // Create first instances table
    console.log('5. Creating onemap_first_instances table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS onemap_first_instances (
        id SERIAL PRIMARY KEY,
        pole_number VARCHAR(100),
        status_type VARCHAR(100) NOT NULL,
        normalized_status VARCHAR(255) NOT NULL,
        first_date TIMESTAMP WITH TIME ZONE NOT NULL,
        property_id VARCHAR(50) NOT NULL,
        original_status TEXT,
        batch_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        UNIQUE(pole_number, status_type)
      )
    `);
    console.log('   ✅ onemap_first_instances created\n');

    // Verify tables were created
    console.log('🔍 Verifying table creation...');

    try {
      // Check if tables exist by querying the information schema
      const result = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('onemap_imports', 'onemap_import_batches', 'onemap_change_history', 'onemap_import_reports', 'onemap_first_instances')
      `;

      const foundTables = result.map(row => row.table_name);
      const expectedTables = ['onemap_imports', 'onemap_import_batches', 'onemap_change_history', 'onemap_import_reports', 'onemap_first_instances'];

      let createdCount = 0;
      for (const table of expectedTables) {
        if (foundTables.includes(table)) {
          console.log(`   ✅ ${table} - Created`);
          createdCount++;
        } else {
          console.log(`   ❌ ${table} - NOT FOUND`);
        }
      }

      console.log(`\n📈 Result: ${createdCount}/${expectedTables.length} tables created successfully`);

      if (createdCount === expectedTables.length) {
        console.log('\n🎯 SUCCESS: All OneMap tables created successfully!');
        console.log('   You can now run OneMap imports using:');
        console.log('   node scripts/import-onemap-daily.js <csv-file>');
      } else {
        console.log('\n⚠️  WARNING: Some tables were not created');
      }

    } catch (error) {
      console.error('\n❌ Verification failed:', error.message);
    }

    console.log(`\n📈 Result: ${createdCount}/${tablesToCheck.length} tables created successfully`);

    if (createdCount === tablesToCheck.length) {
      console.log('\n🎯 SUCCESS: All OneMap tables created successfully!');
      console.log('   You can now run OneMap imports using:');
      console.log('   node scripts/import-onemap-daily.js <csv-file>');
    } else {
      console.log('\n⚠️  WARNING: Some tables were not created');
    }

  } catch (error) {
    console.error('\n❌ Table creation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTablesDirectly().catch(console.error);
}

module.exports = { createTablesDirectly };