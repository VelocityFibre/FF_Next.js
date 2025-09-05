const { neon } = require('@neondatabase/serverless');

const connectionString = 'postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW()`;
    console.log('✅ Connected to database at:', result[0].now);
    
    // List all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📋 Available tables:');
    tables.forEach(t => console.log('  -', t.table_name));
    
    // Check for key tables and their record counts
    console.log('\n📊 Record counts:');
    
    // Check each table individually with template literals
    try {
      const projectCount = await sql`SELECT COUNT(*) as count FROM projects`;
      console.log(`  projects: ${projectCount[0].count} records`);
    } catch (e) {
      console.log(`  projects: Table not found`);
    }
    
    try {
      const staffCount = await sql`SELECT COUNT(*) as count FROM staff`;
      console.log(`  staff: ${staffCount[0].count} records`);
    } catch (e) {
      console.log(`  staff: Table not found`);
    }
    
    try {
      const clientCount = await sql`SELECT COUNT(*) as count FROM clients`;
      console.log(`  clients: ${clientCount[0].count} records`);
    } catch (e) {
      console.log(`  clients: Table not found`);
    }
    
    try {
      const contractorCount = await sql`SELECT COUNT(*) as count FROM contractors`;
      console.log(`  contractors: ${contractorCount[0].count} records`);
    } catch (e) {
      console.log(`  contractors: Table not found`);
    }
    
    try {
      const polesCount = await sql`SELECT COUNT(*) as count FROM sow_poles`;
      console.log(`  sow_poles: ${polesCount[0].count} records`);
    } catch (e) {
      console.log(`  sow_poles: Table not found`);
    }
    
    try {
      const dropsCount = await sql`SELECT COUNT(*) as count FROM sow_drops`;
      console.log(`  sow_drops: ${dropsCount[0].count} records`);
    } catch (e) {
      console.log(`  sow_drops: Table not found`);
    }
    
    try {
      const fibreCount = await sql`SELECT COUNT(*) as count FROM sow_fibre`;
      console.log(`  sow_fibre: ${fibreCount[0].count} records`);
    } catch (e) {
      console.log(`  sow_fibre: Table not found`);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

testConnection();