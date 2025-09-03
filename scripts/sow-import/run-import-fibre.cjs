const { Client } = require('pg');
const XLSX = require('xlsx');
require('dotenv').config();

const PROJECT_ID = '7e7a6d88-8da1-4ac3-a16e-4b7a91e83439';
const FIBRE_FILE = '/home/louisdup/Downloads/Lawley Fibre.xlsx';
const BATCH_SIZE = 500;  // Smaller batch for fibre as it has fewer records

async function importFibre() {
  console.log('🚀 FIBRE IMPORT (Using Same Proven Method)');
  console.log('============================================================');
  console.log('Project:', PROJECT_ID);
  console.log('Fibre file:', FIBRE_FILE);
  console.log('============================================================\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('✓ Connected to Neon Database\n');
  
  // Read Excel file
  const workbook = XLSX.readFile(FIBRE_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const segments = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📊 Total records in Excel: ${segments.length}`);
  
  // Clear existing fibre for this project
  console.log('\nClearing existing fibre segments for project...');
  await client.query('DELETE FROM sow_fibre WHERE project_id = $1', [PROJECT_ID]);
  console.log('✓ Cleared existing fibre segments\n');
  
  console.log('🔌 IMPORTING FIBRE SEGMENTS (Batch Mode)...');
  
  const startTime = Date.now();
  let totalInserted = 0;
  let skipped = 0;
  
  // Process in batches - but first deduplicate by segment_id
  const uniqueSegments = {};
  segments.forEach(segment => {
    const segmentId = segment.label || segment['Label'] || segment.segment_id;
    if (segmentId && !uniqueSegments[segmentId]) {
      uniqueSegments[segmentId] = segment;
    }
  });
  
  const dedupedSegments = Object.values(uniqueSegments);
  console.log(`Deduped from ${segments.length} to ${dedupedSegments.length} unique segments`);
  
  for (let i = 0; i < dedupedSegments.length; i += BATCH_SIZE) {
    const batch = dedupedSegments.slice(i, i + BATCH_SIZE);
    const batchStart = Date.now();
    
    // Build multi-value INSERT
    const values = [];
    const placeholders = [];
    let valueIndex = 1;
    
    batch.forEach((segment, rowIndex) => {
      // Map Excel columns to database fields
      const segmentId = segment.label || segment['Label'] || segment.segment_id;
      
      if (!segmentId) {
        skipped++;
        return;
      }
      
      // Build placeholders for this row (13 columns)
      const rowPlaceholders = [];
      for (let j = 0; j < 13; j++) {
        rowPlaceholders.push(`$${valueIndex++}`);
      }
      placeholders.push(`(${rowPlaceholders.join(', ')})`);
      
      // Add values matching sow_fibre table structure
      values.push(
        PROJECT_ID,                                          // project_id
        segmentId,                                           // segment_id
        segment['Cable Size'] || segment.cable_size || null, // cable_size
        segment.Layer || segment.layer || null,              // layer
        parseFloat(segment.Length || segment.length) || 0,   // distance
        parseInt(segment['PON No'] || segment.pon_no) || null, // pon_no
        parseInt(segment['Zone No'] || segment.zone_no) || null, // zone_no
        segment['String Com'] || null,                       // string_completed
        segment['Date Comp'] ? new Date(segment['Date Comp']) : null, // date_completed
        segment.Contractor || segment.contractor || null,    // contractor
        segment.Complete === 'Yes' ? 'completed' : 'planned', // status
        segment.Complete === 'Yes',                          // is_complete
        JSON.stringify(segment)                             // raw_data
      );
    });
    
    if (placeholders.length > 0) {
      const query = `
        INSERT INTO sow_fibre (
          project_id, segment_id, cable_size, layer, distance,
          pon_no, zone_no, string_completed, date_completed,
          contractor, status, is_complete, raw_data
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (project_id, segment_id) DO UPDATE SET
          cable_size = EXCLUDED.cable_size,
          layer = EXCLUDED.layer,
          distance = EXCLUDED.distance,
          pon_no = EXCLUDED.pon_no,
          zone_no = EXCLUDED.zone_no,
          string_completed = EXCLUDED.string_completed,
          date_completed = EXCLUDED.date_completed,
          contractor = EXCLUDED.contractor,
          status = EXCLUDED.status,
          is_complete = EXCLUDED.is_complete,
          raw_data = EXCLUDED.raw_data,
          updated_at = NOW()
        RETURNING id, segment_id
      `;
      
      const result = await client.query(query, values);
      totalInserted += result.rows.length;
      
      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      const rate = Math.round(result.rows.length / parseFloat(batchTime));
      console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${totalInserted} fibre segments imported (${rate}/sec)`);
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const avgRate = Math.round(totalInserted / parseFloat(totalTime));
  
  // Verify final count
  const countResult = await client.query(
    'SELECT COUNT(*) as count, SUM(distance) as total_length FROM sow_fibre WHERE project_id = $1',
    [PROJECT_ID]
  );
  
  console.log('\n============================================================');
  console.log('✅ IMPORT COMPLETE');
  console.log(`   Imported: ${totalInserted} fibre segments`);
  console.log(`   Skipped: ${skipped} records (no segment ID)`);
  console.log(`   Time: ${totalTime} seconds`);
  console.log(`   Rate: ${avgRate} segments/sec`);
  console.log(`\n📊 Final verification:`);
  console.log(`   Segments in database: ${countResult.rows[0].count}`);
  console.log(`   Total cable length: ${parseFloat(countResult.rows[0].total_length || 0).toFixed(2)} meters`);
  
  await client.end();
}

importFibre().catch(console.error);