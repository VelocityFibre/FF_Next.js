import { sql } from '../lib/neon';

async function testNeonClients() {
  try {
    // 1. Test basic connection
    const test = await sql`SELECT NOW() as current_time`;
    // 2. Check if clients table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'clients'
    `;
    // 3. Get table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `;
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
    });
    
    // 4. Count records
    const count = await sql`SELECT COUNT(*) as total FROM clients`;
    // 5. Get sample data
    if (count[0].total > 0) {
      const sample = await sql`
        SELECT * FROM clients 
        ORDER BY created_at DESC 
        LIMIT 3
      `;
      sample.forEach((client, i) => {
      });
    }
    
    // 6. Test the query used in the service
    const serviceQuery = await sql`
      SELECT 
        c.*,
        s.name as account_manager_name
      FROM clients c
      LEFT JOIN staff s ON c.account_manager_id = s.id
      ORDER BY c.name ASC
      LIMIT 5
    `;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testNeonClients();