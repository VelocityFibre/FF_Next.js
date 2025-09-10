#!/usr/bin/env node

/**
 * Check Migration Tables - Verify OneMap tables were created successfully
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkMigrationTables() {
  console.log('🔍 Checking Neon Database Connection and Migration Tables...\n');

  try {
    const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('No database connection string found. Check DATABASE_URL or VITE_NEON_DATABASE_URL in .env');
    }

    const sql = neon(connectionString);

    // Test basic connection
    console.log('📊 Database Connection Info:');
    const dbInfo = await sql`SELECT VERSION() as version, current_database() as database_name, current_user as user_name`;
    console.log(`   Database: ${dbInfo[0].database_name}`);
    console.log(`   User: ${dbInfo[0].user_name}`);
    console.log(`   PostgreSQL Version: ${dbInfo[0].version.split(' ')[1]}`);
    console.log('');

    // Check if OneMap tables exist
    console.log('📋 Checking OneMap Migration Tables:');

    const onemapTables = [
      'onemap_imports',
      'onemap_import_batches',
      'onemap_change_history',
      'onemap_import_reports',
      'onemap_first_instances'
    ];

    const onemapViews = [
      'onemap_current_records',
      'onemap_recent_changes',
      'onemap_first_instances_summary'
    ];

    let tablesFound = 0;
    let viewsFound = 0;

    // Check tables
    for (const table of onemapTables) {
      try {
        const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
        console.log(`   ✅ ${table} - ${result[0].count} records`);
        tablesFound++;
      } catch (error) {
        console.log(`   ❌ ${table} - NOT FOUND`);
      }
    }

    console.log('');

    // Check views
    console.log('📊 Checking OneMap Views:');
    for (const view of onemapViews) {
      try {
        const result = await sql`SELECT COUNT(*) as count FROM ${sql(view)}`;
        console.log(`   ✅ ${view} - ${result[0].count} records`);
        viewsFound++;
      } catch (error) {
        console.log(`   ❌ ${view} - NOT FOUND`);
      }
    }

    console.log('');
    console.log('📈 Summary:');
    console.log(`   Tables created: ${tablesFound}/${onemapTables.length}`);
    console.log(`   Views created: ${viewsFound}/${onemapViews.length}`);

    if (tablesFound === onemapTables.length && viewsFound === onemapViews.length) {
      console.log('\n🎯 Migration verification: SUCCESS ✅');
      console.log('   All OneMap tables and views are present and accessible!');
    } else {
      console.log('\n⚠️  Migration verification: PARTIAL ⚠️');
      console.log('   Some tables or views may be missing.');
    }

    // Show total table count in database
    console.log('\n📊 Database Overview:');
    const allTables = await sql`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log(`   Total tables in database: ${allTables.length}`);
    console.log('\n📋 All tables in database:');
    allTables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });

  } catch (error) {
    console.error('\n❌ Database connection or query failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkMigrationTables().catch(console.error);
}

module.exports = { checkMigrationTables };