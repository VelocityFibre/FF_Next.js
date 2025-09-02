/**
 * Test direct import of poles from Excel file
 */

import XLSX from 'xlsx';
import fetch from 'node-fetch';

async function testDirectImport() {
  console.log('📋 TESTING DIRECT IMPORT\n');
  console.log('=' .repeat(50) + '\n');

  try {
    const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4'; // louisTest
    
    // 1. Read Excel file
    console.log('1️⃣ Reading Excel file...');
    const excelPath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`   Found ${excelData.length} rows in Excel\n`);
    
    // 2. Process data to match our expected format
    console.log('2️⃣ Processing data...');
    const processedData = excelData.map((row: any) => ({
      pole_number: row['label_1'] || row['Label_1'] || '',
      latitude: parseFloat(row['lat'] || row['Lat'] || 0),
      longitude: parseFloat(row['lon'] || row['Lon'] || 0),
      max_drops: 12,
      current_drops: 0,
      status: 'planned'
    })).filter(item => item.pole_number);
    
    console.log(`   Processed ${processedData.length} valid poles\n`);
    
    // 3. Show sample data
    console.log('3️⃣ Sample data:');
    console.log('   First pole:', processedData[0]);
    console.log('   Last pole:', processedData[processedData.length - 1]);
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
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('TEST COMPLETE');
}

testDirectImport();