/**
 * Test import with just 10 poles to verify it works
 */

import XLSX from 'xlsx';
import fetch from 'node-fetch';

async function testSmallImport() {
  console.log('📋 TESTING SMALL IMPORT (10 poles)\n');
  console.log('=' .repeat(50) + '\n');

  try {
    const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4'; // louisTest
    
    // 1. Read Excel file
    console.log('1️⃣ Reading Excel file...');
    const excelPath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    // Take only first 10 poles
    const smallBatch = excelData.slice(0, 10);
    console.log(`   Using first ${smallBatch.length} poles for test\n`);
    
    // 2. Process data
    console.log('2️⃣ Processing data...');
    const processedData = smallBatch.map((row: any) => ({
      pole_number: row['label_1'] || row['Label_1'] || '',
      latitude: parseFloat(row['lat'] || row['Lat'] || 0),
      longitude: parseFloat(row['lon'] || row['Lon'] || 0),
      max_drops: 12,
      current_drops: 0,
      status: 'planned'
    })).filter(item => item.pole_number);
    
    console.log(`   Processed ${processedData.length} valid poles\n`);
    
    // 3. Show data
    console.log('3️⃣ Test data:');
    processedData.forEach((pole, idx) => {
      console.log(`   ${idx + 1}. ${pole.pole_number} (${pole.latitude}, ${pole.longitude})`);
    });
    console.log('\n');
    
    // 4. Initialize tables
    console.log('4️⃣ Initializing database tables...');
    const initResponse = await fetch(`http://localhost:3001/api/sow/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId })
    });
    
    const initResult = await initResponse.json();
    console.log('   Init result:', initResult);
    console.log('\n');
    
    // 5. Upload poles
    console.log('5️⃣ Uploading poles to database...');
    const uploadResponse = await fetch(`http://localhost:3001/api/sow/poles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, poles: processedData })
    });
    
    const uploadResult = await uploadResponse.json();
    
    if (uploadResult.success) {
      console.log(`   ✅ SUCCESS! Uploaded ${uploadResult.count} poles`);
    } else {
      console.log(`   ❌ FAILED: ${uploadResult.error}`);
    }
    
    // 6. Verify in database
    console.log('\n6️⃣ Verifying in database...');
    const getResponse = await fetch(`http://localhost:3001/api/sow/poles?projectId=${projectId}`);
    const getResult = await getResponse.json();
    
    if (getResult.success) {
      console.log(`   Found ${getResult.count} poles in database`);
      if (getResult.data && getResult.data.length > 0) {
        console.log('   Sample from DB:', getResult.data[0].pole_number);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('TEST COMPLETE');
}

testSmallImport();