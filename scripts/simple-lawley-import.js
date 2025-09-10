#!/usr/bin/env node

/**
 * Simple Lawley Excel Import Script
 * Basic import without complex verification
 */

const { neon } = require('@neondatabase/serverless');
const XLSX = require('xlsx');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Using hardcoded table name for Neon compatibility

async function importLawleyExcel() {
  console.log('🚀 Starting Simple Lawley Excel Import...\n');

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
      throw new Error('Excel file appears to be empty');
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

    let imported = 0;
    let skipped = 0;

    // Import records in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

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

          if ((imported + skipped) % 500 === 0) {
            console.log(`  Progress: ${imported + skipped}/${records.length} records processed (${imported} imported, ${skipped} skipped)`);
          }

        } catch (recordError) {
          console.error(`❌ Error importing record ${record['Property ID']}:`, recordError.message);
          skipped++;
        }
      }
    }

    console.log('\n✅ Import completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total records: ${records.length}`);
    console.log(`   - Successfully imported: ${imported}`);
    console.log(`   - Skipped/Errors: ${skipped}`);

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  importLawleyExcel().catch(console.error);
}

module.exports = { importLawleyExcel };