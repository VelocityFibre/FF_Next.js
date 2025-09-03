const { Client } = require('pg');
const XLSX = require('xlsx');
require('dotenv').config();

async function verifyImport() {
  console.log('=== CROSS-VALIDATION: Database vs Excel ===\n');
  
  // Connect to database
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  // Read Excel file
  const workbook = XLSX.readFile('/home/louisdup/Downloads/Lawley Poles.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(sheet);
  
  // 1. Verify total count
  const countResult = await client.query(
    'SELECT COUNT(*) FROM sow_poles WHERE project_id = $1',
    ['7e7a6d88-8da1-4ac3-a16e-4b7a91e83439']
  );
  console.log(`📊 Total Count Verification:`);
  console.log(`   Excel: ${excelData.length} poles`);
  console.log(`   Database: ${countResult.rows[0].count} poles`);
  console.log(`   Match: ${excelData.length == countResult.rows[0].count ? '✅' : '❌'}\n`);
  
  // 2. Spot check specific poles
  const spotCheckPoles = [
    'LAW.P.A001',  // First pole
    'LAW.P.A100',  // 100th pole
    'LAW.P.A500',  // 500th pole
    'LAW.P.A1000', // 1000th pole
    'LAW.P.Z028'   // Last pole
  ];
  
  console.log('📍 Spot Check Results:');
  console.log('─'.repeat(60));
  
  for (const poleId of spotCheckPoles) {
    // Find in Excel
    const excelPole = excelData.find(p => p.label_1 === poleId);
    
    // Find in Database
    const dbResult = await client.query(
      'SELECT pole_number, latitude, longitude, pon_no, zone_no, status FROM sow_poles WHERE pole_number = $1 AND project_id = $2',
      [poleId, '7e7a6d88-8da1-4ac3-a16e-4b7a91e83439']
    );
    
    if (excelPole && dbResult.rows[0]) {
      const dbPole = dbResult.rows[0];
      console.log(`\nPole: ${poleId}`);
      console.log(`  Latitude:  Excel: ${excelPole.lat} | DB: ${dbPole.latitude}`);
      console.log(`  Longitude: Excel: ${excelPole.lon} | DB: ${dbPole.longitude}`);
      console.log(`  PON No:    Excel: ${excelPole.pon_no} | DB: ${dbPole.pon_no}`);
      console.log(`  Zone No:   Excel: ${excelPole.zone_no} | DB: ${dbPole.zone_no}`);
      console.log(`  Status:    Excel: ${excelPole.status} | DB: ${dbPole.status}`);
      
      // Validate match
      const latMatch = Math.abs(parseFloat(excelPole.lat) - parseFloat(dbPole.latitude)) < 0.000001;
      const lonMatch = Math.abs(parseFloat(excelPole.lon) - parseFloat(dbPole.longitude)) < 0.000001;
      const ponMatch = parseInt(excelPole.pon_no) === parseInt(dbPole.pon_no);
      const zoneMatch = parseInt(excelPole.zone_no) === parseInt(dbPole.zone_no);
      
      console.log(`  Match: ${latMatch && lonMatch && ponMatch && zoneMatch ? '✅' : '❌'}`);
    } else {
      console.log(`\n❌ Pole ${poleId}: ${!excelPole ? 'Not in Excel' : 'Not in Database'}`);
    }
  }
  
  // 3. Check for duplicates
  const dupResult = await client.query(`
    SELECT pole_number, COUNT(*) as count 
    FROM sow_poles 
    WHERE project_id = $1
    GROUP BY pole_number 
    HAVING COUNT(*) > 1
  `, ['7e7a6d88-8da1-4ac3-a16e-4b7a91e83439']);
  
  console.log('\n─'.repeat(60));
  console.log(`\n🔍 Duplicate Check:`);
  console.log(`   Duplicates found: ${dupResult.rows.length > 0 ? `❌ ${dupResult.rows.length}` : '✅ None'}`);
  
  // 4. Random sample validation
  console.log(`\n🎲 Random Sample (5 poles):`);
  const randomResult = await client.query(`
    SELECT pole_number, latitude, longitude 
    FROM sow_poles 
    WHERE project_id = $1
    ORDER BY RANDOM() 
    LIMIT 5
  `, ['7e7a6d88-8da1-4ac3-a16e-4b7a91e83439']);
  
  for (const pole of randomResult.rows) {
    const excelMatch = excelData.find(p => p.label_1 === pole.pole_number);
    if (excelMatch) {
      console.log(`  ${pole.pole_number}: Found in Excel ✅`);
    } else {
      console.log(`  ${pole.pole_number}: NOT in Excel ❌`);
    }
  }
  
  await client.end();
  console.log('\n=== VALIDATION COMPLETE ===');
}

verifyImport().catch(console.error);