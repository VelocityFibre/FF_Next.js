/**
 * Verify Poles Import Script
 * Checks that the poles data was correctly imported to Neon database
 */

import { sql } from '../config/database.config.js';
import XLSX from 'xlsx';

async function verifyPolesImport() {
  console.log('🔍 Verifying Poles Import to Neon Database\n');
  console.log('=========================================\n');

  try {
    // 1. First, get the louisTest project ID
    console.log('1️⃣ Finding louisTest project...');
    const projects = await sql`
      SELECT id, project_code, project_name, status
      FROM projects
      WHERE project_name = 'louisTest' OR project_code LIKE '%louisTest%'
    `;
    
    if (projects.length === 0) {
      console.error('❌ Project "louisTest" not found in database');
      return;
    }
    
    const project = projects[0];
    console.log(`✅ Found project: ${project.project_name} (ID: ${project.id})\n`);

    // 2. Check if there's a poles table or SOW data table
    console.log('2️⃣ Checking for poles data tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%pole%' OR table_name LIKE '%sow%')
      ORDER BY table_name
    `;
    
    console.log('Available related tables:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    console.log();

    // 3. Try to find poles data in various possible tables
    console.log('3️⃣ Searching for imported poles data...\n');
    
    // Check for sow_poles table
    const sowPolesExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'sow_poles'
      ) as exists
    `;
    
    if (sowPolesExists[0].exists) {
      console.log('Found sow_poles table. Checking data...');
      
      // Get count and sample data
      const poleCount = await sql`
        SELECT COUNT(*) as count 
        FROM sow_poles 
        WHERE project_id = ${project.id}
      `;
      
      console.log(`📊 Total poles for project: ${poleCount[0].count}\n`);
      
      if (poleCount[0].count > 0) {
        // Get first 5 poles for verification
        const samplePoles = await sql`
          SELECT * 
          FROM sow_poles 
          WHERE project_id = ${project.id}
          ORDER BY pole_number
          LIMIT 5
        `;
        
        console.log('Sample poles from database:');
        samplePoles.forEach((pole, idx) => {
          console.log(`\nPole ${idx + 1}:`);
          console.log(`  Pole Number: ${pole.pole_number}`);
          console.log(`  Latitude: ${pole.latitude}`);
          console.log(`  Longitude: ${pole.longitude}`);
          console.log(`  Status: ${pole.status || 'N/A'}`);
          console.log(`  Created: ${pole.created_at}`);
        });
      }
    }

    // Check for scope_of_work table
    const sowTableExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'scope_of_work'
      ) as exists
    `;
    
    if (sowTableExists[0].exists) {
      console.log('\nFound scope_of_work table. Checking data...');
      
      const sowData = await sql`
        SELECT * 
        FROM scope_of_work 
        WHERE project_id = ${project.id}
        LIMIT 1
      `;
      
      if (sowData.length > 0) {
        console.log('SOW record found for project');
        console.log(`  SOW Number: ${sowData[0].sow_number || 'N/A'}`);
        console.log(`  Status: ${sowData[0].status}`);
        console.log(`  Created: ${sowData[0].created_at}`);
        
        // Check if poles data is stored in JSONB
        if (sowData[0].deliverables?.poles) {
          console.log(`  Poles in deliverables: ${sowData[0].deliverables.poles.length || 0}`);
        }
      }
    }

    // 4. Compare with Excel file
    console.log('\n4️⃣ Comparing with Excel file...\n');
    
    const excelPath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Excel file contains: ${excelData.length} rows`);
    
    // Spot check - compare first 3 poles
    console.log('\n5️⃣ Spot Check - Comparing first 3 poles:\n');
    console.log('Excel Data vs Database:\n');
    
    for (let i = 0; i < Math.min(3, excelData.length); i++) {
      const excelRow = excelData[i] as any;
      const poleNumber = excelRow.label_1;
      const lat = excelRow.lat;
      const lon = excelRow.lon;
      
      console.log(`Pole ${i + 1}: ${poleNumber}`);
      console.log(`  Excel  - Lat: ${lat}, Lon: ${lon}`);
      
      // Try to find this pole in database
      if (sowPolesExists[0].exists) {
        const dbPole = await sql`
          SELECT pole_number, latitude, longitude 
          FROM sow_poles 
          WHERE project_id = ${project.id} 
          AND pole_number = ${poleNumber}
          LIMIT 1
        `;
        
        if (dbPole.length > 0) {
          console.log(`  DB     - Lat: ${dbPole[0].latitude}, Lon: ${dbPole[0].longitude}`);
          
          // Check if values match
          const latMatch = Math.abs(parseFloat(dbPole[0].latitude) - parseFloat(lat)) < 0.0001;
          const lonMatch = Math.abs(parseFloat(dbPole[0].longitude) - parseFloat(lon)) < 0.0001;
          
          if (latMatch && lonMatch) {
            console.log(`  ✅ Coordinates match!`);
          } else {
            console.log(`  ⚠️ Coordinates don't match exactly`);
          }
        } else {
          console.log(`  ❌ Not found in database`);
        }
      }
      console.log();
    }

    // 6. Summary
    console.log('\n📊 IMPORT VERIFICATION SUMMARY');
    console.log('================================');
    console.log(`Project: ${project.project_name} (${project.project_code})`);
    console.log(`Excel File Rows: ${excelData.length}`);
    
    if (sowPolesExists[0].exists && poleCount) {
      console.log(`Database Poles: ${poleCount[0].count}`);
      
      if (poleCount[0].count === excelData.length) {
        console.log('✅ Row counts match!');
      } else {
        console.log(`⚠️ Row count mismatch: Excel has ${excelData.length}, DB has ${poleCount[0].count}`);
      }
    }

    // Check last few poles from Excel to verify complete import
    console.log('\n7️⃣ Checking last poles (to verify complete import):\n');
    const lastPoles = excelData.slice(-3);
    for (const pole of lastPoles) {
      const poleNumber = (pole as any).label_1;
      console.log(`Checking ${poleNumber}...`);
      
      if (sowPolesExists[0].exists) {
        const exists = await sql`
          SELECT EXISTS(
            SELECT 1 FROM sow_poles 
            WHERE project_id = ${project.id} 
            AND pole_number = ${poleNumber}
          ) as exists
        `;
        
        if (exists[0].exists) {
          console.log(`  ✅ Found in database`);
        } else {
          console.log(`  ❌ Not found in database`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

// Run the verification
verifyPolesImport();