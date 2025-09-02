const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const filePath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
console.log('Reading file:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('\n📊 Workbook Information:');
  console.log('Sheet names:', workbook.SheetNames);
  
  // Examine each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n📋 Sheet ${index + 1}: "${sheetName}"`);
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length > 0) {
      // Show headers (first row)
      console.log('Headers:', jsonData[0]);
      
      // Show first few data rows
      console.log('\nFirst 3 data rows:');
      for (let i = 1; i <= Math.min(3, jsonData.length - 1); i++) {
        console.log(`Row ${i}:`, jsonData[i]);
      }
      
      // Show column analysis
      console.log('\nColumn Analysis:');
      const headers = jsonData[0];
      headers.forEach((header, idx) => {
        if (header) {
          // Check for pole-related columns
          const headerLower = header.toString().toLowerCase();
          if (headerLower.includes('pole') || 
              headerLower.includes('number') || 
              headerLower.includes('lat') || 
              headerLower.includes('long') ||
              headerLower.includes('gps') ||
              headerLower.includes('coord')) {
            console.log(`  Column ${idx}: "${header}" ⭐ (might be important)`);
          } else {
            console.log(`  Column ${idx}: "${header}"`);
          }
        }
      });
      
      console.log(`\nTotal rows: ${jsonData.length - 1} data rows`);
    } else {
      console.log('Sheet is empty');
    }
  });
  
} catch (error) {
  console.error('Error reading Excel file:', error.message);
}