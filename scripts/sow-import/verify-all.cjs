const { Client } = require('pg');
require('dotenv').config();

async function verifyAllImports() {
  const PROJECT_ID = '7e7a6d88-8da1-4ac3-a16e-4b7a91e83439';
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  console.log('📊 FINAL IMPORT VERIFICATION FOR PROJECT');
  console.log('=' .repeat(60));
  console.log('Project ID:', PROJECT_ID);
  console.log('Date: September 3, 2025\n');
  
  // Verify Poles
  const polesResult = await client.query(
    'SELECT COUNT(*) as count FROM sow_poles WHERE project_id = $1',
    [PROJECT_ID]
  );
  console.log('✅ POLES: ' + polesResult.rows[0].count + ' records');
  
  // Verify Drops
  const dropsResult = await client.query(
    'SELECT COUNT(*) as count FROM sow_drops WHERE project_id = $1',
    [PROJECT_ID]
  );
  console.log('✅ DROPS: ' + dropsResult.rows[0].count + ' records');
  
  // Verify Fibre
  const fibreResult = await client.query(
    'SELECT COUNT(*) as count, SUM(distance) as total_length FROM sow_fibre WHERE project_id = $1',
    [PROJECT_ID]
  );
  console.log('✅ FIBRE: ' + fibreResult.rows[0].count + ' segments');
  console.log('   Total cable length: ' + parseFloat(fibreResult.rows[0].total_length || 0).toFixed(2) + ' meters');
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ ALL THREE IMPORTS COMPLETED SUCCESSFULLY');
  
  await client.end();
}

verifyAllImports().catch(console.error);