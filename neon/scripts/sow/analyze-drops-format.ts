/**
 * Analyze Drops Excel file format
 */

import XLSX from 'xlsx';

async function analyzeDropsFormat() {
  console.log('📋 ANALYZING DROPS FILE FORMAT\n');
  console.log('=' .repeat(50) + '\n');
  
  const excelPath = '/home/louisdup/Downloads/Lawley Drops.xlsx';
  
  try {
    // Read Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`File: Lawley Drops.xlsx`);
    console.log(`Sheet: ${sheetName}`);
    console.log(`Total rows: ${data.length}\n`);
    
    // Get column names
    if (data.length > 0) {
      console.log('📊 COLUMN NAMES:');
      const columns = Object.keys(data[0]);
      columns.forEach((col, idx) => {
        console.log(`  ${idx + 1}. "${col}"`);
      });
      
      console.log('\n📝 SAMPLE DATA (First 3 rows):');
      data.slice(0, 3).forEach((row: any, idx) => {
        console.log(`\nRow ${idx + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      });
      
      console.log('\n📝 SAMPLE DATA (Last 3 rows):');
      data.slice(-3).forEach((row: any, idx) => {
        console.log(`\nRow ${data.length - 2 + idx}:`);
        Object.entries(row).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      });
      
      // Analyze data patterns
      console.log('\n📈 DATA ANALYSIS:');
      
      // Check for drop_number pattern
      const sampleDropNumbers = data.slice(0, 5).map((row: any) => 
        row['drop_number'] || row['Drop Number'] || row['drop_id'] || row['Drop ID'] || 
        row['drop'] || row['Drop'] || 'Not found'
      );
      console.log(`  Sample drop numbers: ${sampleDropNumbers.join(', ')}`);
      
      // Check for pole_number pattern
      const samplePoleNumbers = data.slice(0, 5).map((row: any) => 
        row['pole_number'] || row['Pole Number'] || row['pole_id'] || row['Pole ID'] || 
        row['pole'] || row['Pole'] || 'Not found'
      );
      console.log(`  Sample pole numbers: ${samplePoleNumbers.join(', ')}`);
      
      // Check for address pattern
      const sampleAddresses = data.slice(0, 3).map((row: any) => 
        row['address'] || row['Address'] || row['installation_address'] || 
        row['Installation Address'] || row['location'] || row['Location'] || 'Not found'
      );
      console.log(`  Sample addresses:`);
      sampleAddresses.forEach((addr, idx) => {
        console.log(`    ${idx + 1}. ${addr}`);
      });
      
      // Count unique values
      const uniqueDrops = new Set(data.map((row: any) => 
        row[Object.keys(row)[0]]
      )).size;
      const uniquePoles = new Set(data.map((row: any) => 
        row[Object.keys(row)[1]]
      )).size;
      
      console.log(`\n  Unique drops: ${uniqueDrops}`);
      console.log(`  Unique poles referenced: ${uniquePoles}`);
      console.log(`  Total records: ${data.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error reading file:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
}

analyzeDropsFormat();