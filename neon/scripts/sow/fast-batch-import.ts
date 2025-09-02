/**
 * Fast Batch Import for SOW Data
 * Based on optimized techniques from FibreFlow_Firebase
 * Uses batch size of 1000 with multi-value INSERT statements
 */

import { sql } from '../../config/database.config.js';
import XLSX from 'xlsx';

const BATCH_SIZE = 1000; // Optimized batch size from original scripts

async function fastBatchImport(projectId: string, excelPath: string) {
  console.log('🚀 FAST BATCH IMPORT\n');
  console.log('=' .repeat(50) + '\n');
  
  const startTime = Date.now();
  
  try {
    // 1. Read Excel file
    console.log('1️⃣ Reading Excel file...');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`   Found ${excelData.length} rows\n`);
    
    // 2. Process data
    console.log('2️⃣ Processing data...');
    const poles = excelData.map((row: any) => ({
      pole_number: row['label_1'] || row['Label_1'] || row['pole_number'] || '',
      project_id: projectId,
      latitude: parseFloat(row['lat'] || row['Lat'] || row['latitude'] || 0),
      longitude: parseFloat(row['lon'] || row['Lon'] || row['longitude'] || 0),
      status: row['status'] || 'planned',
      metadata: JSON.stringify(row)
    })).filter(p => p.pole_number);
    
    console.log(`   Processed ${poles.length} valid poles\n`);
    
    // 3. Clear existing poles for this project
    console.log('3️⃣ Clearing existing poles...');
    await sql`DELETE FROM poles WHERE project_id = ${projectId}`;
    
    // 4. Insert in batches using multi-value INSERT
    console.log('4️⃣ Starting batch import...\n');
    let totalInserted = 0;
    
    for (let i = 0; i < poles.length; i += BATCH_SIZE) {
      const batch = poles.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      // Build multi-value INSERT query
      const values: any[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;
      
      batch.forEach(pole => {
        placeholders.push(
          `($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5})`
        );
        values.push(
          pole.pole_number,
          pole.project_id,
          pole.latitude,
          pole.longitude,
          pole.status,
          pole.metadata
        );
        paramIndex += 6;
      });
      
      // Use postgres.js transaction for batch insert
      const result = await sql`
        INSERT INTO poles (pole_number, project_id, latitude, longitude, status, metadata)
        SELECT * FROM UNNEST(
          ${batch.map(p => p.pole_number)}::text[],
          ${batch.map(p => p.project_id)}::uuid[],
          ${batch.map(p => p.latitude)}::float8[],
          ${batch.map(p => p.longitude)}::float8[],
          ${batch.map(p => p.status)}::text[],
          ${batch.map(p => p.metadata)}::jsonb[]
        )
        ON CONFLICT (pole_number) DO UPDATE SET
          project_id = EXCLUDED.project_id,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING pole_number
      `;
      totalInserted += result.length;
      
      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      const rate = (batch.length / parseFloat(batchTime)).toFixed(0);
      
      console.log(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} poles in ${batchTime}s (${rate} poles/sec)`);
      console.log(`   Progress: ${totalInserted}/${poles.length} poles`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const avgRate = (totalInserted / parseFloat(totalTime)).toFixed(0);
    
    console.log('\n✅ IMPORT COMPLETE');
    console.log(`   Total: ${totalInserted} poles`);
    console.log(`   Time: ${totalTime} seconds`);
    console.log(`   Rate: ${avgRate} poles/second`);
    
    return { success: true, count: totalInserted, time: totalTime };
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4'; // louisTest
  const excelPath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
  
  fastBatchImport(projectId, excelPath).then(() => {
    console.log('\n' + '=' .repeat(50));
    process.exit(0);
  });
}

export { fastBatchImport };