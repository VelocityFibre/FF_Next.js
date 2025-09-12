const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_aRNLhZc1G2CD@ep-dry-night-a9qyh4sj-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkDatabaseStructure() {
  try {
    console.log('Checking database structure...\n');
    
    // Check projects table columns
    console.log('📊 Projects table structure:');
    const projectColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    if (projectColumns.length > 0) {
      projectColumns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('  ❌ No projects table found!');
    }
    
    // Check clients table columns  
    console.log('\n📊 Clients table structure:');
    const clientColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    if (clientColumns.length > 0) {
      clientColumns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('  ❌ No clients table found!');
    }
    
    // Now get actual data with correct column names
    console.log('\n📋 Fetching projects with correct columns...');
    const projects = await sql`
      SELECT * FROM projects LIMIT 5
    `;
    
    if (projects.length > 0) {
      console.log(`Found ${projects.length} project(s):`);
      console.log('\nFirst project data:');
      console.log(JSON.stringify(projects[0], null, 2));
    } else {
      console.log('No projects found in database.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabaseStructure();