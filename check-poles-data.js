const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkPoles() {
  const projectId = '7f035b5b-d453-4f81-9279-5461acc76e0f';
  
  try {
    // Check pole count
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM sow_poles 
      WHERE project_id = ${projectId}
    `;
    
    console.log(`Poles in Neon database for project ${projectId}: ${result[0].count}`);
    
    // Get sample of first 5 poles
    const poles = await sql`
      SELECT pole_number, latitude, longitude, status
      FROM sow_poles 
      WHERE project_id = ${projectId}
      LIMIT 5
    `;
    
    console.log('\nFirst 5 poles:');
    poles.forEach(pole => {
      console.log(`- ${pole.pole_number}: (${pole.latitude}, ${pole.longitude}) - ${pole.status}`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkPoles();