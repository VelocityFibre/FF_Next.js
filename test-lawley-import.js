const XLSX = require('xlsx');
const path = require('path');

console.log('Testing Lawley Poles.xlsx import...\n');

try {
  const filePath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
  console.log('Reading file:', filePath);
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  console.log('Sheet name:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('\nTotal rows:', rawData.length);
  
  if (rawData.length > 0) {
    console.log('\nFirst row columns:');
    const firstRow = rawData[0];
    Object.keys(firstRow).forEach(key => {
      console.log(`  - ${key}: ${firstRow[key]}`);
    });
    
    // Check for label_1 field (required for pole number)
    const hasLabel1 = rawData.some(row => row.label_1 || row.Label_1);
    console.log('\nHas label_1 field:', hasLabel1);
    
    // Count valid poles (with label_1)
    const validPoles = rawData.filter(row => row.label_1 || row.Label_1).length;
    console.log('Valid poles (with label_1):', validPoles);
    
    // Show sample pole data
    const samplePole = rawData.find(row => row.label_1 || row.Label_1);
    if (samplePole) {
      console.log('\nSample pole data:');
      console.log('  Pole number:', samplePole.label_1 || samplePole.Label_1);
      console.log('  Latitude:', samplePole.lat || samplePole.Lat);
      console.log('  Longitude:', samplePole.lon || samplePole.Lon);
      console.log('  Type:', samplePole.type_1 || samplePole.Type_1);
    }
  }
} catch (error) {
  console.error('Error reading file:', error.message);
}