import { neon } from '@neondatabase/serverless';


if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
}
const databaseUrl = 'process.env.DATABASE_URL';

// Check the actual data structure returned from Neon
async function checkStaffDataStructure() {
  try {
    const sql = neon(databaseUrl);
    
    console.log('🔍 Checking staff data structure from Neon...');
    
    const staff = await sql`SELECT * FROM staff LIMIT 1`;
    
    if (staff.length > 0) {
      const staffMember = staff[0];
      console.log('\n📄 Sample staff member data:');
      console.log(JSON.stringify(staffMember, null, 2));
      
      console.log('\n🔍 Property analysis:');
      console.log(`status: "${staffMember.status}" (type: ${typeof staffMember.status})`);
      console.log(`department: "${staffMember.department}" (type: ${typeof staffMember.department})`);
      console.log(`position: "${staffMember.position}" (type: ${typeof staffMember.position})`);
      console.log(`level: "${staffMember.level}" (type: ${typeof staffMember.level})`);
      console.log(`contractType: "${staffMember.contract_type}" (type: ${typeof staffMember.contract_type})`);
      console.log(`skills: ${JSON.stringify(staffMember.skills)} (type: ${typeof staffMember.skills})`);
      
      console.log('\n🧪 Testing .replace() calls:');
      
      // Test status
      try {
        const statusResult = staffMember.status ? staffMember.status.replace('_', ' ').toUpperCase() : 'N/A';
        console.log(`✅ status.replace(): "${statusResult}"`);
      } catch (e) {
        console.log(`❌ status.replace() failed: ${e.message}`);
      }
      
      // Test department  
      try {
        const deptResult = staffMember.department ? staffMember.department.replace('_', ' ').charAt(0).toUpperCase() + staffMember.department.slice(1) : 'N/A';
        console.log(`✅ department.replace(): "${deptResult}"`);
      } catch (e) {
        console.log(`❌ department.replace() failed: ${e.message}`);
      }
      
      // Test level (might be null)
      try {
        const levelResult = staffMember.level ? staffMember.level.replace('_', ' ').charAt(0).toUpperCase() + staffMember.level.slice(1) : 'Not specified';
        console.log(`✅ level.replace(): "${levelResult}"`);
      } catch (e) {
        console.log(`❌ level.replace() failed: ${e.message}`);
      }
      
      // Test contract_type (note: might be contract_type in DB, contractType in interface)
      try {
        const contractResult = staffMember.contract_type ? staffMember.contract_type.replace('_', ' ').charAt(0).toUpperCase() + staffMember.contract_type.slice(1) : 'N/A';
        console.log(`✅ contract_type.replace(): "${contractResult}"`);
      } catch (e) {
        console.log(`❌ contract_type.replace() failed: ${e.message}`);
      }
      
    } else {
      console.log('❌ No staff members found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking staff data structure:', error.message);
  }
}

checkStaffDataStructure();