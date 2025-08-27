import { neon } from '@neondatabase/serverless';


if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
}
const databaseUrl = 'process.env.DATABASE_URL';

// Test the getAll functionality
async function testStaffGetAll() {
  try {
    const sql = neon(databaseUrl);
    
    console.log('🧪 Testing Staff getAll functionality...');
    
    // Test 1: Get all staff (no filter)
    console.log('\n📋 Test 1: Get all staff');
    const allStaff = await sql`SELECT * FROM staff ORDER BY name ASC`;
    console.log(`✅ Found ${allStaff.length} staff members`);
    allStaff.forEach((staff, index) => {
      console.log(`  ${index + 1}. ${staff.name} - ${staff.position} (${staff.status})`);
    });
    
    // Test 2: Filter by status
    console.log('\n📋 Test 2: Filter by ACTIVE status');
    const activeStaff = await sql`
      SELECT * FROM staff 
      WHERE status = ANY(${'ACTIVE'})
      ORDER BY name ASC
    `;
    console.log(`✅ Found ${activeStaff.length} active staff members`);
    
    // Test 3: Filter by department
    console.log('\n📋 Test 3: Filter by Engineering department');
    const engineeringStaff = await sql`
      SELECT * FROM staff 
      WHERE department = ANY(${'Engineering'})
      ORDER BY name ASC
    `;
    console.log(`✅ Found ${engineeringStaff.length} engineering staff members`);
    
    // Test 4: Test array handling
    console.log('\n📋 Test 4: Filter by multiple statuses');
    const multiStatusStaff = await sql`
      SELECT * FROM staff 
      WHERE status = ANY(${['ACTIVE', 'ON_LEAVE']})
      ORDER BY name ASC
    `;
    console.log(`✅ Found ${multiStatusStaff.length} active/on-leave staff members`);
    
    console.log('\n🎉 All getAll tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in getAll test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStaffGetAll();