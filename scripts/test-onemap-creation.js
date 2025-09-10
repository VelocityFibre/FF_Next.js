#!/usr/bin/env node

/**
 * Test OneMap Table Creation
 * Creates a simple test table to verify database connectivity and table creation
 */

const { neon } = require('@neondatabase/serverless');

async function testTableCreation() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🧪 Testing OneMap table creation...\n');

    // First, check if test table exists and drop it if it does
    console.log('1. Cleaning up any existing test table...');
    await sql.unsafe('DROP TABLE IF EXISTS test_onemap_creation');

    // Create a simple test table
    console.log('2. Creating test table...');
    await sql.unsafe(`
      CREATE TABLE test_onemap_creation (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Insert a test record
    console.log('3. Inserting test record...');
    await sql.unsafe(`
      INSERT INTO test_onemap_creation (name) VALUES ('test_record')
    `);

    // Check if table exists first
    console.log('4. Checking if test table exists...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'test_onemap_creation'
      ) as exists
    `;

    console.log('📊 Table exists check:', tableCheck[0].exists);

    if (tableCheck[0].exists) {
      console.log('4b. Querying test table...');
      const result = await sql`SELECT * FROM test_onemap_creation`;

      console.log('✅ Test table created and queried successfully!');
      console.log('📊 Result type:', typeof result);
      console.log('📊 Result:', result);

      if (Array.isArray(result)) {
        console.log('📊 Records found:', result.length);
        if (result.length > 0) {
          console.log('📋 Record data:', result[0]);
        }
      } else {
        console.log('📊 Single record:', result);
      }
    } else {
      console.log('⚠️  Test table was not found after creation - this indicates a transaction/session issue');
    }

    // Now try creating the actual OneMap tables one by one
    console.log('\n🔧 Creating OneMap tables...');

    // Create onemap_imports table
    console.log('5. Creating onemap_imports table...');
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

    // Create onemap_import_batches table
    console.log('6. Creating onemap_import_batches table...');
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

    // Test if tables exist
    console.log('7. Verifying OneMap tables exist...');
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'onemap_%'
      ORDER BY table_name
    `;

    console.log('📋 Tables result type:', typeof tablesResult);
    console.log('📋 Tables result:', tablesResult);

    if (Array.isArray(tablesResult)) {
      console.log('📋 OneMap tables found:', tablesResult.length);
      tablesResult.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else if (tablesResult && typeof tablesResult === 'object') {
      console.log('📋 Single table result:', tablesResult);
    } else {
      console.log('📋 No tables found or unexpected result format');
    }

    // Clean up test table
    console.log('8. Cleaning up test table...');
    await sql.unsafe('DROP TABLE IF EXISTS test_onemap_creation');

    console.log('\n✅ OneMap table creation test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testTableCreation().catch(console.error);
}

module.exports = { testTableCreation };