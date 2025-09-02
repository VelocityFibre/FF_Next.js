import XLSX from 'xlsx';

const workbook = XLSX.readFile('/home/louisdup/Downloads/Lawley Fibre.xlsx');
const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
const labels = data.map((r: any) => r['label'] || r['Label']).filter(Boolean);

// Find duplicates
const seen = new Set();
const duplicates: string[] = [];
labels.forEach((label: string) => {
  if (seen.has(label)) {
    duplicates.push(label);
  } else {
    seen.add(label);
  }
});

console.log('Total segments:', labels.length);
console.log('Unique segments:', new Set(labels).size);
console.log('Duplicates found:', duplicates.length);
if (duplicates.length > 0) {
  console.log('First 5 duplicates:', duplicates.slice(0, 5));
}