#!/usr/bin/env node

/**
 * Fixed OneMap Table Creation Script
 * Creates the OneMap tables using the correct Neon SQL syntax
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function createOneMapTables() {
  console.log('🔧 Creating OneMap tables with correct syntax...\n');

  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('No database connection string found');
    }

    const sql = neon(connectionString);

    // Create onemap_imports table
    console.log('1. Creating onemap_imports table...');
    await sql`
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
    `;

    // Create onemap_import_batches table
    console.log('2. Creating onemap_import_batches table...');
    await sql`
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
    `;

    // Create onemap_change_history table
    console.log('3. Creating onemap_change_history table...');
    await sql`
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
    `;

    // Create onemap_import_reports table
    console.log('4. Creating onemap_import_reports table...');
    await sql`
      CREATE TABLE IF NOT EXISTS onemap_import_reports (
        id SERIAL PRIMARY KEY,
        batch_id VARCHAR(100) NOT NULL,
        report_type VARCHAR(100) NOT NULL,
        report_data JSONB NOT NULL,
        created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create onemap_first_instances table
    console.log('5. Creating onemap_first_instances table...');
    await sql`
      CREATE TABLE IF NOT EXISTS onemap_first_instances (
        id SERIAL PRIMARY KEY,
        pole_number VARCHAR(100),
        status_type VARCHAR(100) NOT NULL,
        normalized_status VARCHAR(255) NOT NULL,
        first_date TIMESTAMP WITH TIME ZONE NOT NULL,
        property_id VARCHAR(50) NOT NULL,
        original_status TEXT,
        batch_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes
    console.log('6. Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_imports_property_id ON onemap_imports(property_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_imports_tracking_key ON onemap_imports(tracking_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_imports_batch_id ON onemap_imports(import_batch_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_imports_active ON onemap_imports(is_active)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_batches_batch_id ON onemap_import_batches(batch_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_batches_status ON onemap_import_batches(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_batches_date ON onemap_import_batches(import_date)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_history_property_id ON onemap_change_history(property_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_history_batch_id ON onemap_change_history(batch_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_history_change_type ON onemap_change_history(change_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_history_date ON onemap_change_history(change_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_history_first_instance ON onemap_change_history(is_first_instance)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_reports_batch_id ON onemap_import_reports(batch_id)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_first_instances_pole ON onemap_first_instances(pole_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_first_instances_status ON onemap_first_instances(status_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onemap_first_instances_date ON onemap_first_instances(first_date)`;

    // Skip unique constraint for now - can be added later if needed
    console.log('7. Skipping unique constraint (can be added later)...');

    // Create views
    console.log('8. Creating views...');
    await sql`
      CREATE OR REPLACE VIEW onemap_current_records AS
      SELECT
        property_id,
        tracking_key,
        current_data,
        import_batch_id,
        first_seen_date,
        last_updated_date,
        version
      FROM onemap_imports
      WHERE is_active = true
    `;

    await sql`
      CREATE OR REPLACE VIEW onemap_recent_changes AS
      SELECT
        h.property_id,
        h.change_type,
        h.change_date,
        h.is_first_instance,
        h.record_snapshot,
        b.file_name,
        b.import_date
      FROM onemap_change_history h
      JOIN onemap_import_batches b ON h.batch_id = b.batch_id
      ORDER BY h.change_date DESC
      LIMIT 1000
    `;

    await sql`
      CREATE OR REPLACE VIEW onemap_first_instances_summary AS
      SELECT
        status_type,
        COUNT(*) as count,
        MIN(first_date) as earliest_date,
        MAX(first_date) as latest_date
      FROM onemap_first_instances
      GROUP BY status_type
      ORDER BY status_type
    `;

    console.log('\n✅ OneMap tables created successfully!');
    console.log('\n📋 Created:');
    console.log('  - onemap_imports');
    console.log('  - onemap_import_batches');
    console.log('  - onemap_change_history');
    console.log('  - onemap_import_reports');
    console.log('  - onemap_first_instances');
    console.log('  - Associated indexes and views');

  } catch (error) {
    console.error('\n❌ Table creation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createOneMapTables().catch(console.error);
}

module.exports = { createOneMapTables };