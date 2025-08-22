import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Test the filtering functionality
async function testStaffFilters() {
  try {
    const sql = neon(databaseUrl);
    
    console.log('🧪 Testing Staff filtering functionality...');
    
    // Test 1: Get all staff (no filter)
    console.log('\n📋 Test 1: Get all staff (no filter)');
    const allStaff = await sql`SELECT * FROM staff ORDER BY name ASC`;
    console.log(`✅ Found ${allStaff.length} staff members`);
    
    // Test 2: Filter by single status using dynamic query
    console.log('\n📋 Test 2: Filter by ACTIVE status (dynamic query)');
    const query = `SELECT * FROM staff WHERE 1=1 AND status = 'ACTIVE' ORDER BY name ASC`;
    const result = await sql.query(query, []);
    console.log(`✅ Found ${result.rows.length} active staff members via sql.query`);
    
    // Test 3: Test tagged template with single value
    console.log('\n📋 Test 3: Filter by ACTIVE status (tagged template)');
    const activeStatus = 'ACTIVE';
    const activeStaff = await sql`
      SELECT * FROM staff 
      WHERE status = ${activeStatus}
      ORDER BY name ASC
    `;
    console.log(`✅ Found ${activeStaff.length} active staff members via tagged template`);
    
    // Test 4: Multiple statuses
    console.log('\n📋 Test 4: Filter by multiple statuses');
    const multiStatusQuery = `SELECT * FROM staff WHERE 1=1 AND status IN ('ACTIVE','ON_LEAVE') ORDER BY name ASC`;
    const multiStatusResult = await sql.query(multiStatusQuery, []);
    console.log(`✅ Found ${multiStatusResult.rows.length} active/on-leave staff members`);
    
    // Test 5: Department filter
    console.log('\n📋 Test 5: Filter by Engineering department');
    const dept = 'Engineering';
    const engineeringStaff = await sql`
      SELECT * FROM staff 
      WHERE department = ${dept}
      ORDER BY name ASC
    `;
    console.log(`✅ Found ${engineeringStaff.length} engineering staff members`);
    
    console.log('\n🎉 All filtering tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in filtering test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStaffFilters();