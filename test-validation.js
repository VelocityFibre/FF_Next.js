const XLSX = require('xlsx');

// Load the Lawley poles file
const workbook = XLSX.readFile('/home/louisdup/Downloads/Lawley Poles.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);

// Check pole number format
const validFormat = /^[a-zA-Z0-9_-]+$/;
let validCount = 0;
let invalidCount = 0;
const invalidExamples = [];

for (const row of data) {
  const poleNumber = row.label_1;
  if (poleNumber) {
    if (validFormat.test(String(poleNumber).trim())) {
      validCount++;
    } else {
      invalidCount++;
      if (invalidExamples.length < 5) {
        invalidExamples.push(poleNumber);
      }
    }
  }
}

console.log('\nPole number validation with current regex:');
console.log('Valid format:', validCount);
console.log('Invalid format:', invalidCount);
console.log('Invalid examples:', invalidExamples);

// Test what characters are actually in the pole numbers
const uniqueChars = new Set();
for (const row of data) {
  const poleNumber = String(row.label_1 || '');
  for (const char of poleNumber) {
    if (!/[a-zA-Z0-9]/.test(char)) {
      uniqueChars.add(char);
    }
  }
}

console.log('\nSpecial characters found in pole numbers:', Array.from(uniqueChars));