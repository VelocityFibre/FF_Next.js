const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function verifyDemo() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Verifying Demo Database Setup...\n');
  
  try {
    // Check clients
    const clients = await sql`SELECT COUNT(*) as count FROM clients`;
    const clientList = await sql`SELECT client_code, client_name, status FROM clients LIMIT 3`;
    
    console.log(`✅ Clients: ${clients[0].count} records`);
    clientList.forEach(c => console.log(`   - ${c.client_code}: ${c.client_name} (${c.status})`));
    
    // Check projects
    const projects = await sql`SELECT COUNT(*) as count FROM projects`;
    const projectList = await sql`SELECT project_code, project_name, status, progress FROM projects LIMIT 3`;
    
    console.log(`\n✅ Projects: ${projects[0].count} records`);
    projectList.forEach(p => console.log(`   - ${p.project_code}: ${p.project_name} (${p.status}, ${p.progress}% complete)`));
    
    // Check staff
    const staff = await sql`SELECT COUNT(*) as count FROM staff`;
    const staffList = await sql`SELECT employee_id, first_name, last_name, department FROM staff LIMIT 3`;
    
    console.log(`\n✅ Staff: ${staff[0].count} records`);
    staffList.forEach(s => console.log(`   - ${s.employee_id}: ${s.first_name} ${s.last_name} (${s.department})`));
    
    // Check SOW imports
    const sowImports = await sql`SELECT COUNT(*) as count FROM sow_imports`;
    console.log(`\n✅ SOW Imports: ${sowImports[0].count} records`);
    
    console.log('\n🎉 Demo database is ready for testing!');
    console.log('📱 Open http://localhost:5173 to see your app with demo data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyDemo();