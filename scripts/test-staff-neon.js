import { neon } from '@neondatabase/serverless';


if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Check your .env file.');
}
const databaseUrl = 'process.env.DATABASE_URL';

async function testStaffConnection() {
  try {
    const sql = neon(databaseUrl);
    
    console.log('🔍 Testing Neon connection and staff table...');
    
    // Test basic connection
    const testQuery = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testQuery[0].current_time);
    
    // Check if staff table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'staff'
      )
    `;
    
    console.log('📋 Staff table exists:', tableExists[0].exists);
    
    if (tableExists[0].exists) {
      // Get staff count
      const count = await sql`SELECT COUNT(*) as count FROM staff`;
      console.log('👥 Staff records count:', count[0].count);
      
      // Get first few staff records
      const staff = await sql`SELECT id, name, email, department, position FROM staff LIMIT 3`;
      console.log('📝 Sample staff records:');
      staff.forEach((member, index) => {
        console.log(`  ${index + 1}. ${member.name} (${member.email}) - ${member.position} in ${member.department}`);
      });
    } else {
      console.log('⚠️  Staff table does not exist. Need to run schema creation script.');
    }
    
  } catch (error) {
    console.error('❌ Error testing staff connection:', error.message);
  }
}

testStaffConnection();