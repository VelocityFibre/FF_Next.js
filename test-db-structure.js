const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require');

async function testTables() {
  try {
    // Check staff table structure
    console.log('=== STAFF TABLE ===');
    const staffColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'staff' 
      ORDER BY ordinal_position
    `;
    console.log('Staff columns:', staffColumns);
    
    // Check for any staff data
    const staffSample = await sql`SELECT * FROM staff LIMIT 1`;
    console.log('Sample staff record:', staffSample);
    
    // Check clients table structure
    console.log('\n=== CLIENTS TABLE ===');
    const clientColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      ORDER BY ordinal_position
    `;
    console.log('Client columns:', clientColumns);
    
    // Check for any client data
    const clientSample = await sql`SELECT * FROM clients LIMIT 1`;
    console.log('Sample client record:', clientSample);
    
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

testTables();