/**
 * Final verification of poles import
 */

import { sql } from '../../config/database.config.js';
import XLSX from 'xlsx';

async function verifyFinalImport() {
  console.log('🔍 FINAL IMPORT VERIFICATION\n');
  console.log('=' .repeat(50) + '\n');

  try {
    const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4'; // louisTest
    
    // 1. Check total count in database
    console.log('1️⃣ DATABASE STATUS:\n');
    const totalCount = await sql`
      SELECT COUNT(*) as count FROM poles 
      WHERE project_id = ${projectId}
    `;
    
    console.log(`   Total poles in database: ${totalCount[0].count}`);
    
    // 2. Check if any poles exist at all
    const allPoles = await sql`
      SELECT COUNT(*) as count FROM poles
    `;
    console.log(`   Total poles (all projects): ${allPoles[0].count}`);
    
    // 3. Get sample poles if they exist
    if (totalCount[0].count > 0) {
      console.log('\n2️⃣ SAMPLE POLES FROM DATABASE:\n');
      
      // First 3 poles
      const firstPoles = await sql`
        SELECT pole_number, latitude, longitude, status
        FROM poles 
        WHERE project_id = ${projectId}
        ORDER BY pole_number
        LIMIT 3
      `;
      
      console.log('   First 3 poles:');
      firstPoles.forEach((pole, idx) => {
        console.log(`   ${idx + 1}. ${pole.pole_number}`);
        console.log(`      Lat: ${pole.latitude}, Lon: ${pole.longitude}`);
        console.log(`      Status: ${pole.status}`);
      });
      
      // Last 3 poles
      const lastPoles = await sql`
        SELECT pole_number, latitude, longitude, status
        FROM poles 
        WHERE project_id = ${projectId}
        ORDER BY pole_number DESC
        LIMIT 3
      `;
      
      console.log('\n   Last 3 poles:');
      lastPoles.forEach((pole, idx) => {
        console.log(`   ${idx + 1}. ${pole.pole_number}`);
        console.log(`      Lat: ${pole.latitude}, Lon: ${pole.longitude}`);
        console.log(`      Status: ${pole.status}`);
      });
      
      // Check specific poles from Excel
      console.log('\n3️⃣ VERIFICATION AGAINST EXCEL:\n');
      
      const checkPoles = ['LAW.P.A001', 'LAW.P.A100', 'LAW.P.A500', 'LAW.S.A001'];
      
      for (const poleNumber of checkPoles) {
        const dbPole = await sql`
          SELECT pole_number, latitude, longitude
          FROM poles 
          WHERE project_id = ${projectId} 
          AND pole_number = ${poleNumber}
        `;
        
        if (dbPole.length > 0) {
          console.log(`   ✅ ${poleNumber} found in database`);
        } else {
          console.log(`   ❌ ${poleNumber} NOT found in database`);
        }
      }
    } else {
      console.log('\n⚠️  NO POLES FOUND IN DATABASE!\n');
      
      // Check localStorage fallback
      console.log('Checking for data in localStorage fallback...');
      console.log('Please check browser console for localStorage data.');
    }
    
    // 4. Compare with Excel file
    console.log('\n4️⃣ EXCEL FILE COMPARISON:\n');
    
    const excelPath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`   Excel file rows: ${excelData.length}`);
    console.log(`   Database rows: ${totalCount[0].count}`);
    
    if (totalCount[0].count === excelData.length) {
      console.log('\n   ✅ SUCCESS! Row counts match perfectly!');
      console.log(`   All ${excelData.length} poles have been imported.`);
    } else if (totalCount[0].count > 0) {
      console.log(`\n   ⚠️  PARTIAL IMPORT: ${totalCount[0].count} of ${excelData.length} poles imported`);
      console.log(`   Missing: ${excelData.length - totalCount[0].count} poles`);
    } else {
      console.log('\n   ❌ IMPORT FAILED: No poles in database');
      console.log('\n   Possible issues:');
      console.log('   1. Check if the upload actually happened');
      console.log('   2. Check browser console for errors');
      console.log('   3. Check if data is in localStorage (fallback)');
    }
    
    // 5. Check for any errors in metadata
    if (totalCount[0].count > 0) {
      console.log('\n5️⃣ DATA INTEGRITY CHECK:\n');
      
      const invalidPoles = await sql`
        SELECT pole_number 
        FROM poles 
        WHERE project_id = ${projectId}
        AND (latitude IS NULL OR longitude IS NULL OR latitude = 0 OR longitude = 0)
      `;
      
      if (invalidPoles.length > 0) {
        console.log(`   ⚠️  ${invalidPoles.length} poles with invalid coordinates`);
      } else {
        console.log('   ✅ All poles have valid coordinates');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('VERIFICATION COMPLETE');
}

verifyFinalImport();