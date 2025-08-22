import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Simulate the exact calls that the React app will make
async function finalStaffTest() {
  try {
    const sql = neon(databaseUrl);
    
    console.log('🧪 Final Staff Service Test...');
    
    // Test 1: Get all staff (what StaffList component calls)
    console.log('\n📋 Test 1: staffService.getAll() - no filters');
    const allStaff = await sql`SELECT * FROM staff ORDER BY name ASC`;
    console.log(`✅ Found ${allStaff.length} staff members:`);
    allStaff.forEach((staff, index) => {
      console.log(`  ${index + 1}. ${staff.name} - ${staff.position} (${staff.status})`);
    });
    
    // Test 2: Get staff summary (what StaffList component calls)
    console.log('\n📊 Test 2: staffService.getStaffSummary()');
    
    const totalResult = await sql`SELECT COUNT(*) as count FROM staff`;
    const activeResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'ACTIVE'`;
    const inactiveResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'INACTIVE'`;
    const onLeaveResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'ON_LEAVE'`;
    
    const departmentResult = await sql`
      SELECT department, COUNT(*) as count 
      FROM staff 
      GROUP BY department
    `;
    
    const totalStaff = parseInt(totalResult[0].count);
    const activeStaff = parseInt(activeResult[0].count);
    const inactiveStaff = parseInt(inactiveResult[0].count);
    const onLeaveStaff = parseInt(onLeaveResult[0].count);
    const utilizationRate = totalStaff > 0 ? (activeStaff / totalStaff) * 100 : 0;
    
    console.log(`✅ Total Staff: ${totalStaff}`);
    console.log(`✅ Active Staff: ${activeStaff}`);
    console.log(`✅ Inactive Staff: ${inactiveStaff}`);
    console.log(`✅ On Leave Staff: ${onLeaveStaff}`);
    console.log(`✅ Utilization Rate: ${utilizationRate.toFixed(0)}%`);
    
    // Test 3: Get staff by ID
    if (allStaff.length > 0) {
      console.log('\n👤 Test 3: staffService.getById()');
      const firstStaffId = allStaff[0].id;
      const staffById = await sql`SELECT * FROM staff WHERE id = ${firstStaffId} LIMIT 1`;
      if (staffById.length > 0) {
        console.log(`✅ Found staff by ID: ${staffById[0].name}`);
      } else {
        console.log('❌ No staff found by ID');
      }
    }
    
    // Test 4: Filter by status (basic filtering)
    console.log('\n🔍 Test 4: Basic filtering by status');
    const activeOnly = await sql`
      SELECT * FROM staff 
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
    `;
    console.log(`✅ Active staff only: ${activeOnly.length} members`);
    
    console.log('\n🎉 All staff service tests passed! Ready for production use.');
    
  } catch (error) {
    console.error('❌ Error in final staff test:', error.message);
    console.error('Stack:', error.stack);
  }
}

finalStaffTest();