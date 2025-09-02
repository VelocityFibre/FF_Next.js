/**
 * Analyze Fibre Excel file format
 */

import XLSX from 'xlsx';

async function analyzeFibreFormat() {
  console.log('📋 ANALYZING FIBRE FILE FORMAT\n');
  console.log('=' .repeat(50) + '\n');
  
  const excelPath = '/home/louisdup/Downloads/Lawley Fibre.xlsx';
  
  try {
    // Read Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`File: Lawley Fibre.xlsx`);
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
      
      // Check for segment_id pattern
      const sampleSegmentIds = data.slice(0, 5).map((row: any) => 
        row['segment_id'] || row['Segment ID'] || row['cable_id'] || row['Cable ID'] || 
        row['label'] || row['Label'] || 'Not found'
      );
      console.log(`  Sample segment IDs: ${sampleSegmentIds.join(', ')}`);
      
      // Check for from/to points
      const sampleFromPoints = data.slice(0, 3).map((row: any) => 
        row['from_point'] || row['From Point'] || row['start_point'] || row['Start Point'] ||
        row['strtfeat'] || row['Start Feature'] || 'Not found'
      );
      console.log(`  Sample from points: ${sampleFromPoints.join(', ')}`);
      
      const sampleToPoints = data.slice(0, 3).map((row: any) => 
        row['to_point'] || row['To Point'] || row['end_point'] || row['End Point'] ||
        row['endfeat'] || row['End Feature'] || 'Not found'
      );
      console.log(`  Sample to points: ${sampleToPoints.join(', ')}`);
      
      // Check for distance/length
      const sampleDistances = data.slice(0, 3).map((row: any) => 
        row['distance'] || row['Distance'] || row['length'] || row['Length'] || 
        row['dim2'] || row['cable_length'] || 'Not found'
      );
      console.log(`  Sample distances: ${sampleDistances.join(', ')}`);
      
      // Count unique values
      const uniqueSegments = new Set(data.map((row: any) => 
        row[Object.keys(row)[0]]
      )).size;
      
      console.log(`\n  Total segments: ${data.length}`);
      console.log(`  Unique segments: ${uniqueSegments}`);
    }
    
  } catch (error) {
    console.error('❌ Error reading file:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
}

analyzeFibreFormat();