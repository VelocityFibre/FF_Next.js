import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function testStaffCRUD() {
  try {
    const sql = neon(databaseUrl);
    
    console.log('🧪 Testing Staff CRUD Operations...');
    
    // Test Create
    console.log('\n📝 Testing CREATE operation...');
    const createResult = await sql`
      INSERT INTO staff (employee_id, name, email, phone, department, position, status, join_date)
      VALUES ('TEST001', 'Test User', 'test@example.com', '555-0123', 'Engineering', 'Developer', 'ACTIVE', CURRENT_DATE)
      RETURNING *
    `;
    
    if (createResult.length > 0) {
      console.log('✅ CREATE successful:', createResult[0].name);
      const testUserId = createResult[0].id;
      
      // Test Read
      console.log('\n📖 Testing READ operation...');
      const readResult = await sql`SELECT * FROM staff WHERE id = ${testUserId}`;
      if (readResult.length > 0) {
        console.log('✅ READ successful:', readResult[0].name);
      } else {
        console.log('❌ READ failed: No data found');
      }
      
      // Test Update
      console.log('\n✏️ Testing UPDATE operation...');
      const updateResult = await sql`
        UPDATE staff 
        SET position = 'Senior Developer', updated_at = NOW()
        WHERE id = ${testUserId}
        RETURNING *
      `;
      if (updateResult.length > 0) {
        console.log('✅ UPDATE successful:', updateResult[0].position);
      } else {
        console.log('❌ UPDATE failed');
      }
      
      // Test List All
      console.log('\n📋 Testing LIST operation...');
      const listResult = await sql`SELECT name, email, department, position FROM staff LIMIT 5`;
      console.log(`✅ LIST successful: Found ${listResult.length} staff members`);
      listResult.forEach((member, index) => {
        console.log(`  ${index + 1}. ${member.name} - ${member.position} (${member.department})`);
      });
      
      // Test Delete
      console.log('\n🗑️ Testing DELETE operation...');
      const deleteResult = await sql`DELETE FROM staff WHERE id = ${testUserId} RETURNING name`;
      if (deleteResult.length > 0) {
        console.log('✅ DELETE successful:', deleteResult[0].name);
      } else {
        console.log('❌ DELETE failed');
      }
      
    } else {
      console.log('❌ CREATE failed: No data returned');
    }
    
    console.log('\n🎉 All CRUD operations tested successfully!');
    
  } catch (error) {
    console.error('❌ Error in CRUD testing:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStaffCRUD();