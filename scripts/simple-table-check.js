#!/usr/bin/env node

/**
 * Simple Table Check - Quick verification of OneMap tables
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function simpleTableCheck() {
  console.log('🔍 Simple OneMap Table Check...\n');

  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('No database connection string found');
    }

    const sql = neon(connectionString);

    // Check database info
    console.log('📊 Database Info:');
    const dbInfo = await sql`SELECT current_database() as db, current_schema() as schema`;
    console.log(`   Database: ${dbInfo[0].db}`);
    console.log(`   Schema: ${dbInfo[0].schema}\n`);

    // Check all tables in public schema
    console.log('📋 All tables in public schema:');
    const allTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tableNames = allTables.map(row => row.table_name);
    console.log(`   Found ${tableNames.length} tables\n`);

    // Check for OneMap tables specifically
    const onemapTables = tableNames.filter(name => name.startsWith('onemap_'));
    console.log('🔍 OneMap tables found:');
    if (onemapTables.length > 0) {
      onemapTables.forEach(table => console.log(`   ✅ ${table}`));
    } else {
      console.log('   ❌ No OneMap tables found');
    }

    console.log('\n📋 All tables:');
    tableNames.forEach(table => console.log(`   - ${table}`));

  } catch (error) {
    console.error('\n❌ Check failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  simpleTableCheck().catch(console.error);
}

module.exports = { simpleTableCheck };