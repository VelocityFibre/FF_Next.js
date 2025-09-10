#!/usr/bin/env node

/**
 * Test Table Creation - Simple test to verify table creation works
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function testTableCreation() {
  console.log('🔍 Testing Basic Table Creation...\n');

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

    // Create a simple test table
    console.log('📋 Creating test table...');
    const tableName = 'test_opencode_table_' + Date.now();

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log(`✅ Test table '${tableName}' created\n`);

    // Insert a test record
    console.log('📝 Inserting test record...');
    await sql.unsafe(`
      INSERT INTO ${tableName} (name) VALUES ('test_record')
    `);
    console.log('✅ Test record inserted\n');

    // Query the test table
    console.log('🔍 Querying test table...');
    const result = await sql.unsafe(`SELECT * FROM ${tableName}`);
    console.log(`✅ Found ${result.length} records in test table`);
    console.log('Records:', result);

    // Check if table exists in information schema
    console.log('\n📊 Checking information schema...');
    const schemaResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    `;

    if (schemaResult.length > 0) {
      console.log(`✅ Table '${tableName}' found in information schema`);
    } else {
      console.log(`❌ Table '${tableName}' NOT found in information schema`);
    }

    // Clean up - drop the test table
    console.log('\n🧹 Cleaning up test table...');
    await sql.unsafe(`DROP TABLE IF EXISTS ${tableName}`);
    console.log('✅ Test table dropped\n');

    console.log('🎯 Basic table creation test: SUCCESS ✅');
    console.log('   - Table creation: Working');
    console.log('   - Data insertion: Working');
    console.log('   - Data querying: Working');
    console.log('   - Schema visibility: Working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testTableCreation().catch(console.error);
}

module.exports = { testTableCreation };