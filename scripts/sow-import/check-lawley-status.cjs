#!/usr/bin/env node
const { Client } = require('pg');
require('dotenv').config();

async function checkStatus() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  const projectId = '31c6184f-ad32-47ce-9930-25073574cdcd';
  
  console.log('\n📊 LAWLEY PROJECT STATUS CHECK');
  console.log('=' .repeat(60));
  
  // Check project
  const project = await client.query(
    'SELECT project_name, location, latitude, longitude FROM projects WHERE id = $1',
    [projectId]
  );
  
  if (project.rows.length > 0) {
    console.log('✅ Project Found:', project.rows[0].project_name);
    console.log('   Location:', project.rows[0].location);
    console.log('   GPS:', project.rows[0].latitude, project.rows[0].longitude);
  }
  
  // Check drops
  const drops = await client.query(
    'SELECT COUNT(*) as count FROM sow_drops WHERE project_id = $1',
    [projectId]
  );
  console.log('\n💧 Drops imported:', drops.rows[0].count);
  
  // Check fibre
  const fibre = await client.query(
    `SELECT COUNT(*) as count, SUM(distance) as total_length 
     FROM sow_fibre WHERE project_id = $1`,
    [projectId]
  );
  console.log('🔌 Fibre segments imported:', fibre.rows[0].count);
  console.log('   Total cable length:', parseFloat(fibre.rows[0].total_length || 0).toFixed(2), 'meters');
  
  console.log('\n' + '=' .repeat(60));
  
  await client.end();
}

checkStatus().catch(console.error);