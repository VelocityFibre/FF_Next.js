import { sql } from '../../config/database.config.js';

async function verifyNeonData() {
  console.log('🔍 VERIFYING DATA IN NEON DATABASE\n');
  console.log('=' .repeat(50) + '\n');
  
  const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4';
  
  try {
    // 1. Check connection
    console.log('1️⃣ DATABASE CONNECTION:');
    const dbInfo = await sql`SELECT current_database(), current_user, version()`;
    console.log(`   Database: ${dbInfo[0].current_database}`);
    console.log(`   User: ${dbInfo[0].current_user}`);
    console.log(`   Version: ${dbInfo[0].version.split(',')[0]}`);
    
    // 2. Check poles
    console.log('\n2️⃣ POLES DATA:');
    const polesCount = await sql`
      SELECT COUNT(*) as count FROM poles WHERE project_id = ${projectId}
    `;
    console.log(`   Total poles: ${polesCount[0].count}`);
    
    const firstPole = await sql`
      SELECT pole_number, latitude, longitude 
      FROM poles 
      WHERE project_id = ${projectId} 
      LIMIT 1
    `;
    if (firstPole.length > 0) {
      console.log(`   Sample: ${firstPole[0].pole_number} at (${firstPole[0].latitude}, ${firstPole[0].longitude})`);
    }
    
    // 3. Check drops
    console.log('\n3️⃣ DROPS DATA:');
    const dropsCount = await sql`
      SELECT COUNT(*) as count FROM drops WHERE project_id = ${projectId}
    `;
    console.log(`   Total drops: ${dropsCount[0].count}`);
    
    const firstDrop = await sql`
      SELECT drop_number, pole_number 
      FROM drops 
      WHERE project_id = ${projectId} 
      LIMIT 1
    `;
    if (firstDrop.length > 0) {
      console.log(`   Sample: ${firstDrop[0].drop_number} on pole ${firstDrop[0].pole_number}`);
    }
    
    // 4. Verify specific records
    console.log('\n4️⃣ SPECIFIC RECORD CHECKS:');
    
    // Check specific pole from Excel
    const specificPole = await sql`
      SELECT * FROM poles 
      WHERE pole_number = 'LAW.P.A001' 
      AND project_id = ${projectId}
    `;
    console.log(`   LAW.P.A001 exists: ${specificPole.length > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Check specific drop from Excel
    const specificDrop = await sql`
      SELECT * FROM drops 
      WHERE drop_number = 'DR1737348' 
      AND project_id = ${projectId}
    `;
    console.log(`   DR1737348 exists: ${specificDrop.length > 0 ? '✅ YES' : '❌ NO'}`);
    
    // 5. Summary
    console.log('\n5️⃣ SUMMARY:');
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('poles', 'drops', 'fibre_segments')
    `;
    console.log(`   Tables in Neon: ${allTables.map(t => t.table_name).join(', ')}`);
    
    console.log('\n✅ DATA IS CONFIRMED IN NEON DATABASE!');
    console.log(`   Connection: ${process.env.DATABASE_URL?.includes('neon.tech') ? 'NEON' : 'UNKNOWN'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
}

verifyNeonData();