import { neon } from '@neondatabase/serverless';


if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
}
const databaseUrl = 'process.env.DATABASE_URL';

// Mock the staff summary logic from the Neon service
async function testStaffSummary() {
  try {
    const sql = neon(databaseUrl);
    
    console.log('🧪 Testing Staff Summary...');
    
    const totalResult = await sql`SELECT COUNT(*) as count FROM staff`;
    const activeResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'ACTIVE'`;
    const inactiveResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'INACTIVE'`;
    const onLeaveResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'ON_LEAVE'`;
    
    // Get department breakdown
    const departmentResult = await sql`
      SELECT department, COUNT(*) as count 
      FROM staff 
      GROUP BY department
    `;
    
    const totalStaff = parseInt(totalResult[0].count);
    const activeStaff = parseInt(activeResult[0].count);
    const inactiveStaff = parseInt(inactiveResult[0].count);
    const onLeaveStaff = parseInt(onLeaveResult[0].count);
    
    // Calculate utilization rate (assuming active staff are utilized)
    const utilizationRate = totalStaff > 0 ? (activeStaff / totalStaff) * 100 : 0;
    
    // Build department breakdown
    const staffByDepartment = {};
    departmentResult.forEach((dept) => {
      staffByDepartment[dept.department] = parseInt(dept.count);
    });
    
    const summary = {
      totalStaff,
      activeStaff,
      inactiveStaff,
      onLeaveStaff,
      availableStaff: activeStaff,
      utilizationRate,
      staffByDepartment
    };
    
    console.log('\n📊 Staff Summary Results:');
    console.log('✅ Total Staff:', summary.totalStaff);
    console.log('✅ Active Staff:', summary.activeStaff);
    console.log('✅ Inactive Staff:', summary.inactiveStaff);
    console.log('✅ On Leave Staff:', summary.onLeaveStaff);
    console.log('✅ Utilization Rate:', summary.utilizationRate.toFixed(1) + '%');
    
    console.log('\n🏢 Department Breakdown:');
    Object.entries(summary.staffByDepartment).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count}`);
    });
    
    console.log('\n🎯 Testing toFixed() call:');
    console.log('utilizationRate:', summary.utilizationRate);
    console.log('utilizationRate.toFixed(0):', summary.utilizationRate.toFixed(0));
    
    console.log('\n🎉 Staff summary test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in staff summary test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStaffSummary();