/**
 * Test import with 100 poles
 */

import XLSX from 'xlsx';
import fetch from 'node-fetch';

async function test100Poles() {
  console.log('📋 TESTING 100 POLES IMPORT\n');
  console.log('=' .repeat(50) + '\n');

  try {
    const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4'; // louisTest
    
    // 1. Read Excel file
    console.log('1️⃣ Reading Excel file...');
    const excelPath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    // Take only first 100 poles
    const testBatch = excelData.slice(0, 100);
    console.log(`   Using first ${testBatch.length} poles for test\n`);
    
    // 2. Process data
    const processedData = testBatch.map((row: any) => ({
      pole_number: row['label_1'] || row['Label_1'] || '',
      latitude: parseFloat(row['lat'] || row['Lat'] || 0),
      longitude: parseFloat(row['lon'] || row['Lon'] || 0),
      max_drops: 12,
      current_drops: 0,
      status: 'planned'
    })).filter(item => item.pole_number);
    
    console.log(`2️⃣ Processed ${processedData.length} valid poles\n`);
    
    // 3. Upload poles
    console.log('3️⃣ Uploading poles to database...');
    const startTime = Date.now();
    
    const uploadResponse = await fetch(`http://localhost:3001/api/sow/poles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, poles: processedData })
    });
    
    const uploadResult = await uploadResponse.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (uploadResult.success) {
      console.log(`   ✅ SUCCESS! Uploaded ${uploadResult.count} poles in ${duration}s`);
    } else {
      console.log(`   ❌ FAILED: ${uploadResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('TEST COMPLETE');
}

test100Poles();