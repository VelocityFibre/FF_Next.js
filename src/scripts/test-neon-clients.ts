import { sql } from '../lib/neon';

async function testNeonClients() {
  console.log('Testing Neon clients connection...\n');
  
  try {
    // 1. Test basic connection
    console.log('1. Testing connection...');
    const test = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful:', test[0].current_time);
    
    // 2. Check if clients table exists
    console.log('\n2. Checking if clients table exists...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'clients'
    `;
    console.log('✅ Clients table exists:', tables.length > 0);
    
    // 3. Get table structure
    console.log('\n3. Getting clients table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `;
    console.log('Columns in clients table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
    });
    
    // 4. Count records
    console.log('\n4. Counting client records...');
    const count = await sql`SELECT COUNT(*) as total FROM clients`;
    console.log(`✅ Total clients in database: ${count[0].total}`);
    
    // 5. Get sample data
    if (count[0].total > 0) {
      console.log('\n5. Sample client data:');
      const sample = await sql`
        SELECT * FROM clients 
        ORDER BY created_at DESC 
        LIMIT 3
      `;
      sample.forEach((client, i) => {
        console.log(`\nClient ${i + 1}:`);
        console.log(`  ID: ${client.id}`);
        console.log(`  Name: ${client.name}`);
        console.log(`  Contact: ${client.contact_person}`);
        console.log(`  Email: ${client.email}`);
        console.log(`  Status: ${client.status}`);
      });
    }
    
    // 6. Test the query used in the service
    console.log('\n6. Testing service query...');
    const serviceQuery = await sql`
      SELECT 
        c.*,
        s.name as account_manager_name
      FROM clients c
      LEFT JOIN staff s ON c.account_manager_id = s.id
      ORDER BY c.name ASC
      LIMIT 5
    `;
    console.log(`✅ Service query returned ${serviceQuery.length} records`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testNeonClients();