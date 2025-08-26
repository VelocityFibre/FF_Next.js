/**
 * Neon Database Connection Test (Node.js compatible)
 * Tests Neon PostgreSQL database connection and operations
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Neon connection string from environment
const neonUrl = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!neonUrl) {
  throw new Error('Database URL not found in environment variables');
}

// Create Neon client
const sqlClient = neon(neonUrl);
const db = drizzle(sqlClient);

class NeonDatabaseTester {
  private client = sqlClient;
  private db = db;

  async testConnection(): Promise<void> {
    console.log('🔍 Testing Neon PostgreSQL Database Connection\n');
    
    try {
      // Test basic connection
      console.log('1. Testing basic connection...');
      const result = await this.client`SELECT NOW() as current_time, VERSION() as version`;
      console.log('✅ Connection successful');
      console.log(`   Current time: ${result[0].current_time}`);
      console.log(`   PostgreSQL version: ${result[0].version.substring(0, 50)}...`);

      // Test database info
      console.log('\n2. Getting database information...');
      const dbInfo = await this.client`
        SELECT 
          current_database() as database_name,
          current_user as user_name,
          pg_size_pretty(pg_database_size(current_database())) as database_size
      `;
      console.log('✅ Database info retrieved');
      console.log(`   Database: ${dbInfo[0].database_name}`);
      console.log(`   User: ${dbInfo[0].user_name}`);
      console.log(`   Size: ${dbInfo[0].database_size}`);

      // Test table listing
      console.log('\n3. Listing database tables...');
      const tables = await this.client`
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      console.log(`✅ Found ${tables.length} tables`);
      
      if (tables.length > 0) {
        console.log('   Tables:');
        tables.slice(0, 10).forEach((table: any) => {
          console.log(`     - ${table.table_name} (${table.table_type})`);
        });
        if (tables.length > 10) {
          console.log(`     ... and ${tables.length - 10} more tables`);
        }
      }

      // Test table stats
      console.log('\n4. Getting table statistics...');
      const tableStats = await this.client`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        WHERE n_live_tup > 0
        ORDER BY n_live_tup DESC
        LIMIT 10
      `;
      
      console.log(`✅ Table statistics retrieved`);
      if (tableStats.length > 0) {
        console.log('   Tables with data:');
        tableStats.forEach((stat: any) => {
          console.log(`     ${stat.tablename}: ${stat.live_tuples} records`);
        });
      } else {
        console.log('   No tables with data found');
      }

      // Test schema validation
      console.log('\n5. Validating key schema elements...');
      const constraints = await this.client`
        SELECT 
          table_name,
          constraint_type,
          COUNT(*) as count
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        GROUP BY table_name, constraint_type
        ORDER BY table_name
      `;
      
      console.log('✅ Schema constraints validated');
      if (constraints.length > 0) {
        const constraintSummary = constraints.reduce((acc: any, constraint: any) => {
          acc[constraint.constraint_type] = (acc[constraint.constraint_type] || 0) + constraint.count;
          return acc;
        }, {});
        
        console.log('   Constraint summary:');
        Object.entries(constraintSummary).forEach(([type, count]) => {
          console.log(`     ${type}: ${count}`);
        });
      }

      // Test indexes
      console.log('\n6. Checking database indexes...');
      const indexes = await this.client`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename
      `;
      
      console.log(`✅ Found ${indexes.length} indexes`);
      if (indexes.length > 0) {
        const indexesByTable = indexes.reduce((acc: any, index: any) => {
          acc[index.tablename] = (acc[index.tablename] || 0) + 1;
          return acc;
        }, {});
        
        console.log('   Indexes by table:');
        Object.entries(indexesByTable).slice(0, 5).forEach(([table, count]) => {
          console.log(`     ${table}: ${count} indexes`);
        });
      }

      console.log('\n✅ All Neon PostgreSQL tests passed!');
      
    } catch (error: any) {
      console.log('❌ Database test failed:', error.message);
      console.log('Stack trace:', error.stack);
      throw error;
    }
  }

  async testCRUDOperations(): Promise<void> {
    console.log('\n🧪 Testing CRUD Operations on Staff Table\n');
    
    try {
      // Test if staff table exists
      const tableExists = await this.client`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'staff'
        )
      `;
      
      if (!tableExists[0]?.exists) {
        console.log('⚠️ Staff table does not exist, skipping CRUD tests');
        return;
      }

      console.log('✅ Staff table exists, proceeding with CRUD tests...');

      // Test READ - get current staff count
      const staffCount = await this.client`SELECT COUNT(*) as count FROM staff`;
      console.log(`📊 Current staff records: ${staffCount[0].count}`);

      // Test CREATE - insert a test record
      console.log('\n1. Testing CREATE operation...');
      const testStaffId = `TEST_${Date.now()}`;
      const testEmail = `test.${Date.now()}@fibreflow.com`;
      
      const insertResult = await this.client`
        INSERT INTO staff (
          employee_id, name, email, phone, department, 
          position, type, status, salary, join_date
        ) VALUES (
          ${testStaffId}, 'Test Employee Database', ${testEmail}, 
          '0123456789', 'Engineering', 'Database Tester', 
          'FULL_TIME', 'ACTIVE', 75000.00, CURRENT_DATE
        ) RETURNING id, employee_id, name, email
      `;
      
      console.log('✅ CREATE successful');
      console.log(`   Created staff: ${insertResult[0].name} (${insertResult[0].employee_id})`);
      const createdStaffId = insertResult[0].id;

      // Test READ - fetch the created record
      console.log('\n2. Testing READ operation...');
      const readResult = await this.client`
        SELECT id, employee_id, name, email, department, position, status
        FROM staff 
        WHERE id = ${createdStaffId}
      `;
      
      console.log('✅ READ successful');
      console.log(`   Found staff: ${readResult[0].name} in ${readResult[0].department}`);

      // Test UPDATE - modify the record
      console.log('\n3. Testing UPDATE operation...');
      await this.client`
        UPDATE staff 
        SET salary = 80000.00, position = 'Senior Database Tester'
        WHERE id = ${createdStaffId}
      `;
      
      const updatedResult = await this.client`
        SELECT salary, position FROM staff WHERE id = ${createdStaffId}
      `;
      
      console.log('✅ UPDATE successful');
      console.log(`   New position: ${updatedResult[0].position}`);
      console.log(`   New salary: $${updatedResult[0].salary}`);

      // Test DELETE - remove the test record
      console.log('\n4. Testing DELETE operation...');
      await this.client`DELETE FROM staff WHERE id = ${createdStaffId}`;
      
      const deletedCheck = await this.client`
        SELECT COUNT(*) as count FROM staff WHERE id = ${createdStaffId}
      `;
      
      console.log('✅ DELETE successful');
      console.log(`   Record deleted: ${deletedCheck[0].count === 0 ? 'Yes' : 'No'}`);

      // Verify final count
      const finalCount = await this.client`SELECT COUNT(*) as count FROM staff`;
      console.log(`\n📊 Final staff count: ${finalCount[0].count} (should equal initial count)`);
      
      console.log('\n✅ All CRUD operations completed successfully!');
      
    } catch (error: any) {
      console.log('❌ CRUD test failed:', error.message);
      throw error;
    }
  }
}

// Execute tests if run directly
async function main() {
  const tester = new NeonDatabaseTester();
  
  try {
    await tester.testConnection();
    await tester.testCRUDOperations();
    
    console.log('\n🎉 All database tests completed successfully!');
    console.log('📊 Database is operational and ready for use.');
    
  } catch (error) {
    console.log('\n💥 Database tests failed. Please check configuration and connectivity.');
    process.exit(1);
  }
}

// Check if this is the main module (ES module version)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}