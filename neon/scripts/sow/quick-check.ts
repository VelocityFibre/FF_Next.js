import { sql } from '../../config/database.config.js';

async function quickCheck() {
  const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4';
  
  const count = await sql`
    SELECT COUNT(*) as count 
    FROM poles 
    WHERE project_id = ${projectId}
  `;
  
  console.log('✅ CONFIRMED: Poles in database:', count[0].count);
  
  // Sample check
  const samples = await sql`
    SELECT pole_number 
    FROM poles 
    WHERE project_id = ${projectId}
    LIMIT 5
  `;
  
  console.log('\nSample poles:');
  samples.forEach(p => console.log(`  - ${p.pole_number}`));
}

quickCheck();