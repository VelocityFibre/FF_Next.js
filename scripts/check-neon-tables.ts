/**
 * Check Neon Database Tables
 * Quick script to verify database schema and tables
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Create direct SQL connection
const neonUrl = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL || '';
const sql = neon(neonUrl);

async function checkTables() {
  console.log('🔍 Checking Neon Database Tables\n');
  
  try {
    // Get database info
    console.log('📊 Database Information:');
    const versionResult = await sql`SELECT VERSION() as version`;
    const infoResult = await sql`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        current_database() as database_name,
        current_user as user_name
    `;
    
    if (infoResult.length > 0) {
      console.log(`   Database: ${infoResult[0].database_name}`);
      console.log(`   Size: ${infoResult[0].database_size}`);
      console.log(`   User: ${infoResult[0].user_name}`);
      console.log(`   Version: ${versionResult[0].version.split(' ').slice(0, 2).join(' ')}`);
    }

    // Check for tables
    console.log('\n📋 Checking for existing tables:');
    const tableListResult = await sql`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    if (tableListResult.length === 0) {
      console.log('   ❌ No tables found in public schema');
      console.log('   🔧 Database appears to be empty - needs schema setup');
    } else {
      console.log(`   ✅ Found ${tableListResult.length} tables:`);
      tableListResult.forEach((table: any) => {
        console.log(`     - ${table.table_name}`);
      });

      // Get row counts for each table
      console.log('\n📊 Table row counts:');
      for (const table of tableListResult) {
        try {
          const countResult = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`;
          const count = countResult[0]?.count || 0;
          console.log(`     ${table.table_name}: ${count} rows`);
        } catch (error) {
          console.log(`     ${table.table_name}: Error counting rows`);
        }
      }
    }

    // Check for migrations table
    console.log('\n🔄 Checking migration status:');
    try {
      const migrationResult = await sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_name LIKE '%migration%' OR table_name LIKE '%drizzle%'
      `;
      
      if (migrationResult.length > 0) {
        console.log('   ✅ Migration tracking tables found:');
        migrationResult.forEach((table: any) => {
          console.log(`     - ${table.table_name}`);
        });
      } else {
        console.log('   ❌ No migration tracking tables found');
        console.log('   🔧 May need to run: npx drizzle-kit push');
      }
    } catch (error) {
      console.log('   ❌ Could not check migration status');
    }

  } catch (error: any) {
    console.log('❌ Database check failed:', error.message);
  }

  console.log('\n✨ Database check completed!');
}

checkTables().catch(console.error);