#!/usr/bin/env node
const { Client } = require('pg');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config();

const PROJECT_ID = '31c6184f-ad32-47ce-9930-25073574cdcd';
const DROPS_FILE = './docs/Uploads/Lawley/Drops_Lawley.xlsx';
const FIBRE_FILE = './docs/Uploads/Lawley/Fibre_Lawley.xlsx';
const BATCH_SIZE = 1000;

async function continueDropsImport(client) {
  console.log('\n💧 CONTINUING DROPS IMPORT...');
  console.log('=' .repeat(60));
  
  // Read Excel file
  const workbook = XLSX.readFile(DROPS_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const drops = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📊 Total records in Excel: ${drops.length}`);
  
  // Check how many already imported
  const existing = await client.query(
    'SELECT COUNT(*) as count FROM sow_drops WHERE project_id = $1',
    [PROJECT_ID]
  );
  
  const alreadyImported = parseInt(existing.rows[0].count);
  console.log(`Already imported: ${alreadyImported}`);
  
  // Skip the already imported ones
  const remainingDrops = drops.slice(alreadyImported);
  console.log(`Remaining to import: ${remainingDrops.length}\n`);
  
  const startTime = Date.now();
  let totalInserted = alreadyImported;
  let skipped = 0;
  
  // Process remaining in batches
  for (let i = 0; i < remainingDrops.length; i += BATCH_SIZE) {
    const batch = remainingDrops.slice(i, i + BATCH_SIZE);
    const batchStart = Date.now();
    
    const values = [];
    const placeholders = [];
    let valueIndex = 1;
    
    batch.forEach((drop) => {
      const dropNumber = drop.label || drop.Label || drop.drop_number || drop['Drop Number'];
      const poleNumber = drop.strtfeat || drop['Start Feature'] || drop.pole_number;
      
      if (!dropNumber) {
        skipped++;
        return;
      }
      
      const rowPlaceholders = [];
      for (let j = 0; j < 19; j++) {
        rowPlaceholders.push(`$${valueIndex++}`);
      }
      placeholders.push(`(${rowPlaceholders.join(', ')})`);
      
      values.push(
        PROJECT_ID,
        dropNumber,
        poleNumber || null,
        drop.type || drop.Type || null,
        drop.spec || drop.Spec || null,
        parseFloat(drop.dim2 || drop.Length) || null,
        drop.cblcpty || null,
        drop.strtfeat || null,
        drop.endfeat || null,
        -26.2837,
        27.8999,
        drop.endfeat || null,
        parseInt(drop.pon_no) || null,
        parseInt(drop.zone_no) || null,
        drop.mun || 'City of Johannesburg',
        drop.status || 'planned',
        drop.datecrtd ? new Date(drop.datecrtd) : new Date(),
        drop.crtdby || 'Import',
        JSON.stringify(drop)
      );
    });
    
    if (placeholders.length > 0) {
      const query = `
        INSERT INTO sow_drops (
          project_id, drop_number, pole_number, cable_type, cable_spec,
          cable_length, cable_capacity, start_point, end_point,
          latitude, longitude, address, pon_no, zone_no,
          municipality, status, created_date, created_by, raw_data
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (project_id, drop_number) DO UPDATE SET
          pole_number = EXCLUDED.pole_number,
          cable_type = EXCLUDED.cable_type,
          cable_spec = EXCLUDED.cable_spec,
          cable_length = EXCLUDED.cable_length,
          updated_at = NOW()
        RETURNING id
      `;
      
      try {
        const result = await client.query(query, values);
        totalInserted += result.rows.length;
        
        const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
        const rate = Math.round(result.rows.length / parseFloat(batchTime));
        const batchNum = Math.floor((alreadyImported + i) / BATCH_SIZE) + 1;
        console.log(`✅ Batch ${batchNum}: ${totalInserted} total drops (${rate}/sec)`);
      } catch (err) {
        console.error(`❌ Batch error:`, err.message);
      }
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Drops import complete: ${totalInserted} total (took ${totalTime}s)`);
  return totalInserted;
}

async function importFibre(client) {
  console.log('\n🔌 IMPORTING FIBRE DATA...');
  console.log('=' .repeat(60));
  
  const workbook = XLSX.readFile(FIBRE_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const segments = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📊 Total records in Excel: ${segments.length}`);
  
  // Clear existing fibre
  await client.query('DELETE FROM sow_fibre WHERE project_id = $1', [PROJECT_ID]);
  console.log('✓ Cleared existing fibre segments\n');
  
  const startTime = Date.now();
  let totalInserted = 0;
  let skipped = 0;
  
  // Deduplicate
  const uniqueSegments = {};
  segments.forEach(segment => {
    const segmentId = segment.label || segment.Label || segment['Segment ID'];
    if (segmentId && !uniqueSegments[segmentId]) {
      uniqueSegments[segmentId] = segment;
    }
  });
  
  const dedupedSegments = Object.values(uniqueSegments);
  console.log(`Deduped to ${dedupedSegments.length} unique segments`);
  
  for (let i = 0; i < dedupedSegments.length; i += 500) {
    const batch = dedupedSegments.slice(i, i + 500);
    const batchStart = Date.now();
    
    const values = [];
    const placeholders = [];
    let valueIndex = 1;
    
    batch.forEach((segment) => {
      const segmentId = segment.label || segment.Label || segment['Segment ID'];
      
      if (!segmentId) {
        skipped++;
        return;
      }
      
      const rowPlaceholders = [];
      for (let j = 0; j < 13; j++) {
        rowPlaceholders.push(`$${valueIndex++}`);
      }
      placeholders.push(`(${rowPlaceholders.join(', ')})`);
      
      const isComplete = segment.Complete === 'Yes' || segment.Status === 'Completed';
      
      values.push(
        PROJECT_ID,
        segmentId,
        segment['Cable Size'] || segment.cable_size || '48F',
        segment.Layer || segment.layer || 'Core',
        parseFloat(segment.Length || segment.length || segment.Distance) || 0,
        parseInt(segment['PON No'] || segment.pon_no) || null,
        parseInt(segment['Zone No'] || segment.zone_no) || null,
        segment['String Com'] || null,
        segment['Date Comp'] ? new Date(segment['Date Comp']) : null,
        segment.Contractor || 'Lawley Team',
        isComplete ? 'completed' : 'planned',
        isComplete,
        JSON.stringify(segment)
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
          distance = EXCLUDED.distance,
          status = EXCLUDED.status,
          is_complete = EXCLUDED.is_complete,
          updated_at = NOW()
        RETURNING id
      `;
      
      try {
        const result = await client.query(query, values);
        totalInserted += result.rows.length;
        
        const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
        const rate = Math.round(result.rows.length / parseFloat(batchTime));
        console.log(`✅ Batch ${Math.floor(i / 500) + 1}: ${totalInserted} segments (${rate}/sec)`);
      } catch (err) {
        console.error(`❌ Batch error:`, err.message);
      }
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Fibre import complete: ${totalInserted} segments (took ${totalTime}s)`);
  return totalInserted;
}

async function main() {
  console.log('\n🚀 CONTINUING LAWLEY IMPORT');
  console.log('=' .repeat(60));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✓ Connected to Neon Database');
    
    // Continue drops import
    await continueDropsImport(client);
    
    // Import fibre
    await importFibre(client);
    
    // Final verification
    console.log('\n📊 FINAL STATUS');
    console.log('=' .repeat(60));
    
    const drops = await client.query(
      'SELECT COUNT(*) as count FROM sow_drops WHERE project_id = $1',
      [PROJECT_ID]
    );
    
    const fibre = await client.query(
      `SELECT COUNT(*) as count, SUM(distance) as total_length 
       FROM sow_fibre WHERE project_id = $1`,
      [PROJECT_ID]
    );
    
    console.log('✅ IMPORT COMPLETE');
    console.log(`   Total Drops: ${drops.rows[0].count}`);
    console.log(`   Total Fibre: ${fibre.rows[0].count} segments`);
    console.log(`   Total Cable: ${parseFloat(fibre.rows[0].total_length || 0).toFixed(2)} meters`);
    
    console.log('\n✅ Data is now available in:');
    console.log('   - SOW Management: /pages/sow/list');
    console.log('   - Pole Tracker: /pages/pole-tracker/');
    console.log('   - Project Dashboard: /pages/projects/');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

main().catch(console.error);