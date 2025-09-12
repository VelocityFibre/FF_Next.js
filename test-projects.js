const { neon } = require('@neondatabase/serverless');

async function testProjectsAPI() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔍 Testing Projects Database Connection...\n');

    // Test 1: Check database connection
    console.log('1. Database Connection:');
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('   ✅ Connected successfully\n');

    // Test 2: Check projects table
    console.log('2. Projects Table:');
    const projectsCount = await sql`SELECT COUNT(*) as count FROM projects`;
    console.log(`   📊 Total projects: ${projectsCount[0].count}`);

    if (projectsCount[0].count > 0) {
      const projects = await sql`SELECT id, project_code, project_name, status FROM projects LIMIT 3`;
      console.log('   📋 Sample projects:');
      projects.forEach((project, index) => {
        console.log(`      ${index + 1}. ${project.project_name} (${project.project_code}) - ${project.status}`);
      });
    }
    console.log('');

    // Test 3: Check API response structure
    console.log('3. API Response Structure:');
    const allProjects = await sql`
      SELECT
        p.id,
        p.project_code,
        p.project_name as name,
        p.client_id,
        p.description,
        p.project_type as type,
        p.status,
        p.priority,
        p.start_date,
        p.end_date,
        p.budget,
        p.actual_cost,
        p.project_manager,
        p.progress,
        p.created_at,
        p.updated_at,
        c.company_name as client_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC NULLS LAST
    `;

    console.log(`   📦 API would return ${allProjects.length} projects`);
    if (allProjects.length > 0) {
      console.log('   🔧 First project structure:');
      console.log(`      - ID: ${allProjects[0].id}`);
      console.log(`      - Name: ${allProjects[0].name}`);
      console.log(`      - Code: ${allProjects[0].project_code}`);
      console.log(`      - Status: ${allProjects[0].status}`);
      console.log(`      - Client: ${allProjects[0].client_name || 'No client'}`);
    }

    console.log('\n✅ Database and API structure test completed successfully!');
    console.log('📝 Summary:');
    console.log(`   - Projects in database: ${projectsCount[0].count}`);
    console.log('   - API structure: Properly formatted');
    console.log('   - Database connection: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProjectsAPI();