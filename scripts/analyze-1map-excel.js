const XLSX = require('xlsx');
const path = require('path');

// Function to analyze Excel file structure
function analyzeExcelFile(filePath) {
  console.log(`\n=== Analyzing: ${path.basename(filePath)} ===\n`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    
    console.log(`Sheets found: ${workbook.SheetNames.join(', ')}\n`);
    
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n--- Sheet: ${sheetName} ---`);
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length > 0) {
        // Show column headers
        const headers = Object.keys(jsonData[0]);
        console.log(`Columns: ${headers.join(', ')}`);
        console.log(`Number of rows: ${jsonData.length}`);
        
        // Show first 3 rows as sample
        console.log('\nSample data (first 3 rows):');
        jsonData.slice(0, 3).forEach((row, index) => {
          console.log(`Row ${index + 1}:`, JSON.stringify(row, null, 2));
        });
      } else {
        console.log('No data in this sheet');
      }
    });
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
  }
}

// Analyze the actual 1Map file
const files = [
  './pages/onemap/sample-data/Lawley_08092025.xlsx'
];

files.forEach(file => {
  if (require('fs').existsSync(file)) {
    analyzeExcelFile(file);
  } else {
    console.log(`File not found: ${file}`);
  }
});