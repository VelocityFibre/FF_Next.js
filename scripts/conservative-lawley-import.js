#!/usr/bin/env node

/**
 * Conservative Lawley Excel Import Script
 * Sequential processing with smaller batches to avoid connection limits
 */

const { neon } = require('@neondatabase/serverless');
const XLSX = require('xlsx');

// Database connection
const sql = neon(process.env.DATABASE_URL);

async function conservativeImportLawleyExcel() {
  console.log('🚀 Starting Conservative Lawley Excel Import...\n');

  try {
    const filePath = 'pages/onemap/downloads/lawley_01092025.xlsx';

    // Read Excel file
    console.log('📊 Reading Excel file...');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`📋 Using sheet: ${sheetName}`);

    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      throw new Error('Excel file appears to empty');
    }

    // First row is headers
    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);

    console.log(`✅ Found ${dataRows.length} data rows`);
    console.log(`📊 Columns: ${headers.length}`);

    // Convert to objects
    const records = dataRows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || '';
      });
      return record;
    });

    console.log(`\n📥 Importing ${records.length} records to database...`);

    // Check current progress
    const existingCount = await sql`SELECT COUNT(*) as count FROM onemap_records`;
    const alreadyImported = existingCount[0].count;
    console.log(`📊 Already imported: ${alreadyImported} records`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Use smaller batch size and sequential processing
    const batchSize = 50; // Reduced from 500
    const startTime = Date.now();

    // Find the starting point more efficiently using batch checking
    console.log('🔍 Finding starting point...');
    let startIndex = 0;
    const checkBatchSize = 100; // Check in batches of 100

    for (let i = 0; i < records.length; i += checkBatchSize) {
      const batch = records.slice(i, i + checkBatchSize);
      const propertyIds = batch.map(r => r['Property ID']).filter(id => id);

      if (propertyIds.length === 0) continue;

      // Check how many of these records already exist
      const existing = await sql`
        SELECT property_id FROM onemap_records
        WHERE property_id = ANY(${propertyIds})
      `;

      const existingIds = new Set(existing.map(r => r.property_id));

      // Find the first record in this batch that doesn't exist
      for (let j = 0; j < batch.length; j++) {
        const record = batch[j];
        if (record['Property ID'] && !existingIds.has(record['Property ID'])) {
          startIndex = i + j;
          break;
        }
      }

      if (startIndex > 0) break;

      console.log(`   Checked records ${i + 1}-${Math.min(i + checkBatchSize, records.length)}: ${existing.length}/${propertyIds.length} already exist`);
    }

    console.log(`📍 Starting from record ${startIndex + 1} of ${records.length}`);

    for (let i = startIndex; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchStartTime = Date.now();

      console.log(`\n🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil((records.length - startIndex)/batchSize)} (${batch.length} records)`);

      // Process batch sequentially to avoid connection limits
      for (const record of batch) {
        try {
          // Check if record already exists
          const existing = await sql`
            SELECT id FROM onemap_records
            WHERE property_id = ${record['Property ID']}
            LIMIT 1
          `;

          if (existing.length > 0) {
            skipped++;
            continue;
          }

          // Insert new record
          await sql`
            INSERT INTO onemap_records (
              property_id,
              status,
              pole_number,
              drop_number,
              location_address,
              latitude,
              longitude,
              created_date,
              updated_date
            ) VALUES (
              ${record['Property ID'] || null},
              ${record['Status'] || null},
              ${record['Pole Number'] || null},
              ${record['Drop Number'] || null},
              ${record['Location Address'] || null},
              ${record['Latitude'] ? parseFloat(record['Latitude']) : null},
              ${record['Longitude'] ? parseFloat(record['Longitude']) : null},
              ${new Date().toISOString()},
              ${new Date().toISOString()}
            )
          `;

          imported++;

        } catch (recordError) {
          console.error(`❌ Error with record ${record['Property ID']}:`, recordError.message);
          errors++;
        }
      }

      const batchTime = (Date.now() - batchStartTime) / 1000;
      const totalTime = (Date.now() - startTime) / 1000;
      const recordsPerSecond = (imported + skipped) / totalTime;

      console.log(`✅ Batch completed in ${batchTime.toFixed(1)}s`);
      console.log(`   - Imported: ${imported - (i > 0 ? Math.floor(i/batchSize) * 50 : 0)}`);
      console.log(`   - Skipped: ${skipped - (i > 0 ? Math.floor(i/batchSize) * 50 : 0)}`);
      console.log(`   - Errors: ${errors}`);
      console.log(`   - Rate: ${recordsPerSecond.toFixed(1)} records/sec`);

      // Progress update every 10 batches
      if ((i / batchSize + 1) % 10 === 0 || i + batchSize >= records.length) {
        const totalProcessed = imported + skipped + errors;
        const progressPercent = Math.round((totalProcessed / records.length) * 100);
        console.log(`\n📊 Overall Progress: ${progressPercent}% (${totalProcessed}/${records.length})`);
        console.log(`   - Successfully imported: ${imported}`);
        console.log(`   - Skipped (duplicates): ${skipped}`);
        console.log(`   - Errors: ${errors}`);
        console.log(`   - Average rate: ${recordsPerSecond.toFixed(1)} records/sec`);
      }

      // Add small delay between batches to be gentle on the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const finalCount = await sql`SELECT COUNT(*) as count FROM onemap_records`;
    const totalImported = finalCount[0].count - alreadyImported;

    console.log('\n🎉 Import completed!');
    console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
    console.log(`📊 Final summary:`);
    console.log(`   - Records processed: ${records.length}`);
    console.log(`   - New records imported: ${totalImported}`);
    console.log(`   - Duplicates skipped: ${skipped}`);
    console.log(`   - Errors encountered: ${errors}`);
    console.log(`   - Average speed: ${(records.length / totalTime).toFixed(1)} records/sec`);
    console.log(`   - Total records in database: ${finalCount[0].count}`);

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  conservativeImportLawleyExcel().catch(console.error);
}

module.exports = { conservativeImportLawleyExcel };
