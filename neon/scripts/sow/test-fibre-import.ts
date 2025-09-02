import { sql } from '../../config/database.config.js';
import XLSX from 'xlsx';

async function testFibreImport() {
  console.log('🧪 TESTING FIBRE IMPORT WITH STATUS TRACKING\n');
  console.log('=' .repeat(50) + '\n');
  
  const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4';
  const excelPath = '/home/louisdup/Downloads/Lawley Fibre.xlsx';
  
  try {
    // 1. Check current import status
    console.log('1️⃣ Current Import Status:');
    const currentStatus = await sql`
      SELECT step_type, status, records_imported, completed_at
      FROM sow_import_status
      WHERE project_id = ${projectId}
      ORDER BY 
        CASE step_type
          WHEN 'poles' THEN 1
          WHEN 'drops' THEN 2
          WHEN 'fibre' THEN 3
        END
    `;
    
    currentStatus.forEach(s => {
      const icon = s.status === 'completed' ? '✅' : s.status === 'failed' ? '❌' : '⏳';
      console.log(`   ${icon} ${s.step_type}: ${s.status} (${s.records_imported || 0} records)`);
    });
    
    // 2. Read and prepare fibre data
    console.log('\n2️⃣ Reading Fibre Data:');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`   Found ${data.length} fibre segments`);
    
    // 3. Process data (similar to validator)
    const processedData = data.map((row: any) => {
      const label = row['label'] || row['Label'] || '';
      let fromPoint = '';
      let toPoint = '';
      if (label && label.includes('-')) {
        const parts = label.split('-');
        fromPoint = parts[0].split('.').slice(-1)[0];
        toPoint = parts[1];
      }
      
      return {
        segment_id: label,
        from_point: fromPoint,
        to_point: toPoint,
        distance: parseFloat(row['length'] || row['Length'] || 0),
        cable_type: row['cable size'] || row['Cable Size'] || 'standard',
        cable_size: row['cable size'] || row['Cable Size'] || '',
        layer: row['layer'] || row['Layer'] || '',
        pon_no: parseInt(row['pon_no'] || row['PON_NO'] || 0),
        zone_no: parseInt(row['zone_no'] || row['Zone_No'] || 0),
        contractor: row['contractor'] || row['Contractor'] || '',
        complete: row['complete'] || row['Complete'] || '',
        status: (row['complete'] || row['Complete']) === 'Yes' ? 'completed' : 'planned'
      };
    }).filter((item: any) => item.segment_id);
    
    console.log(`   Processed ${processedData.length} valid segments`);
    
    // 4. Call API endpoint
    console.log('\n3️⃣ Calling API to import fibre:');
    const response = await fetch('http://localhost:3001/api/sow/fibre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        fibres: processedData
      })
    });
    
    const result = await response.json();
    console.log(`   Response: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.message) console.log(`   Message: ${result.message}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    
    // 5. Verify import
    console.log('\n4️⃣ Verifying Import:');
    const count = await sql`
      SELECT COUNT(*) as count FROM fibre_segments WHERE project_id = ${projectId}
    `;
    console.log(`   Fibre segments in database: ${count[0].count}`);
    
    // 6. Check updated status
    console.log('\n5️⃣ Updated Import Status:');
    const updatedStatus = await sql`
      SELECT step_type, status, records_imported, completed_at
      FROM sow_import_status
      WHERE project_id = ${projectId}
      ORDER BY 
        CASE step_type
          WHEN 'poles' THEN 1
          WHEN 'drops' THEN 2
          WHEN 'fibre' THEN 3
        END
    `;
    
    updatedStatus.forEach(s => {
      const icon = s.status === 'completed' ? '✅' : s.status === 'failed' ? '❌' : '⏳';
      console.log(`   ${icon} ${s.step_type}: ${s.status} (${s.records_imported || 0} records)`);
    });
    
    console.log('\n✅ FIBRE IMPORT TEST COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
}

testFibreImport();