const { neon } = require('@neondatabase/serverless');

const connectionString = 'postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function checkSchema() {
  try {
    console.log('Checking database schema...\n');
    
    // Check projects table schema
    console.log('📋 PROJECTS table columns:');
    const projectColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position
    `;
    projectColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check staff table schema
    console.log('\n📋 STAFF table columns:');
    const staffColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'staff' 
      ORDER BY ordinal_position
    `;
    staffColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check clients table schema
    console.log('\n📋 CLIENTS table columns:');
    const clientColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      ORDER BY ordinal_position
    `;
    clientColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check sow_imports for SOW data
    console.log('\n📋 SOW_IMPORTS table columns:');
    const sowColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'sow_imports' 
      ORDER BY ordinal_position
    `;
    sowColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Get sample project data
    console.log('\n📊 Sample project data:');
    const sampleProject = await sql`SELECT * FROM projects LIMIT 1`;
    if (sampleProject.length > 0) {
      console.log(JSON.stringify(sampleProject[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();