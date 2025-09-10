#!/usr/bin/env node

/**
 * Analyze Excel File Structure
 * Quick script to examine the structure of an Excel file
 */

const XLSX = require('xlsx');
const path = require('path');

function analyzeExcelFile(filePath) {
  console.log(`\n=== Analyzing Excel File: ${path.basename(filePath)} ===\n`);

  try {
    const workbook = XLSX.readFile(filePath);

    console.log(`📊 Workbook Info:`);
    console.log(`   Sheets found: ${workbook.SheetNames.join(', ')}`);
    console.log(`   Number of sheets: ${workbook.SheetNames.length}\n`);

    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`--- Sheet ${index + 1}: ${sheetName} ---`);

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        // First row is headers
        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);

        console.log(`   Columns (${headers.length}): ${headers.join(', ')}`);
        console.log(`   Data rows: ${dataRows.length}`);
        console.log(`   Total rows: ${jsonData.length}`);

        // Show sample data
        if (dataRows.length > 0) {
          console.log(`\n   Sample data (first row):`);
          const sampleRow = dataRows[0];
          headers.forEach((header, index) => {
            console.log(`     ${header}: ${sampleRow[index] || 'N/A'}`);
          });
        }

        // Check for expected columns
        const expectedColumns = ['Property ID', 'Pole Number', 'Drop Number', 'Status', 'Location Address', 'Latitude', 'Longitude'];
        const foundColumns = expectedColumns.filter(col => headers.includes(col));
        const missingColumns = expectedColumns.filter(col => !headers.includes(col));

        console.log(`\n   ✅ Found columns: ${foundColumns.join(', ')}`);
        if (missingColumns.length > 0) {
          console.log(`   ⚠️  Missing columns: ${missingColumns.join(', ')}`);
        }

      } else {
        console.log('   No data in this sheet');
      }

      console.log(''); // Empty line between sheets
    });

  } catch (error) {
    console.error(`❌ Error reading Excel file: ${error.message}`);
    console.error('Make sure the file exists and is a valid Excel file (.xlsx or .xls)');
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/analyze-excel-file.js <excel-file-path>');
  console.error('Example: node scripts/analyze-excel-file.js /path/to/lawley_01092025.xlsx');
  process.exit(1);
}

const filePath = args[0];

// Check if file exists
const fs = require('fs');
if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  console.error('Please check the file path and try again.');
  process.exit(1);
}

analyzeExcelFile(filePath);