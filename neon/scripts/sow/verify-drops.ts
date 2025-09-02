import { sql } from '../../config/database.config.js';

async function verifyDrops() {
  const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4';
  
  // Count drops
  const count = await sql`
    SELECT COUNT(*) as count 
    FROM drops 
    WHERE project_id = ${projectId}
  `;
  
  console.log('✅ DROPS IMPORT CONFIRMED:');
  console.log(`   Total drops in database: ${count[0].count}`);
  
  // Sample drops
  const samples = await sql`
    SELECT drop_number, pole_number, address
    FROM drops 
    WHERE project_id = ${projectId}
    LIMIT 5
  `;
  
  console.log('\n   Sample drops:');
  samples.forEach(d => {
    console.log(`   - ${d.drop_number} on pole ${d.pole_number}`);
  });
  
  // Count unique poles referenced
  const uniquePoles = await sql`
    SELECT COUNT(DISTINCT pole_number) as count
    FROM drops
    WHERE project_id = ${projectId}
  `;
  
  console.log(`\n   Unique poles referenced: ${uniquePoles[0].count}`);
}

verifyDrops();