import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function addTestStaff() {
  try {
    const sql = neon(databaseUrl);
    
    console.log('🧪 Adding test staff data...');
    
    // Add some test staff members
    const testStaff = [
      {
        employee_id: 'EMP001',
        name: 'John Smith',
        email: 'john.smith@fibreflow.com',
        phone: '555-0001',
        department: 'Engineering',
        position: 'Senior Developer',
        status: 'ACTIVE'
      },
      {
        employee_id: 'EMP002', 
        name: 'Sarah Johnson',
        email: 'sarah.johnson@fibreflow.com',
        phone: '555-0002',
        department: 'Engineering',
        position: 'Project Manager',
        status: 'ACTIVE'
      },
      {
        employee_id: 'EMP003',
        name: 'Michael Brown',
        email: 'michael.brown@fibreflow.com',
        phone: '555-0003',
        department: 'Operations',
        position: 'Field Technician',
        status: 'ACTIVE'
      },
      {
        employee_id: 'EMP004',
        name: 'Emily Davis',
        email: 'emily.davis@fibreflow.com',
        phone: '555-0004',
        department: 'Quality Assurance',
        position: 'QA Tester',
        status: 'ON_LEAVE'
      },
      {
        employee_id: 'EMP005',
        name: 'Robert Wilson',
        email: 'robert.wilson@fibreflow.com', 
        phone: '555-0005',
        department: 'Engineering',
        position: 'Junior Developer',
        status: 'INACTIVE'
      }
    ];
    
    for (const staff of testStaff) {
      const result = await sql`
        INSERT INTO staff (employee_id, name, email, phone, department, position, status, join_date)
        VALUES (${staff.employee_id}, ${staff.name}, ${staff.email}, ${staff.phone}, ${staff.department}, ${staff.position}, ${staff.status}, CURRENT_DATE)
        ON CONFLICT (employee_id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          department = EXCLUDED.department,
          position = EXCLUDED.position,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING name, status
      `;
      
      console.log(`✅ Added/Updated: ${result[0].name} (${result[0].status})`);
    }
    
    // Check final count
    const totalResult = await sql`SELECT COUNT(*) as count FROM staff`;
    console.log(`\n📊 Total staff members: ${totalResult[0].count}`);
    
    // Check status breakdown
    const statusResult = await sql`
      SELECT status, COUNT(*) as count 
      FROM staff 
      GROUP BY status 
      ORDER BY count DESC
    `;
    
    console.log('\n📋 Status breakdown:');
    statusResult.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
    console.log('\n🎉 Test data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding test staff:', error.message);
  }
}

addTestStaff();