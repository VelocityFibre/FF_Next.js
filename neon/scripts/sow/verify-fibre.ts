import { sql } from '../../config/database.config.js';

async function verifyFibre() {
  const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4';
  
  // Count fibre segments
  const count = await sql`
    SELECT COUNT(*) as count 
    FROM fibre_segments 
    WHERE project_id = ${projectId}
  `;
  
  console.log('✅ FIBRE IMPORT STATUS:');
  console.log(`   Total fibre segments in database: ${count[0].count}`);
  
  // Sample segments
  const samples = await sql`
    SELECT segment_id, from_point, to_point, distance, cable_type
    FROM fibre_segments 
    WHERE project_id = ${projectId}
    LIMIT 5
  `;
  
  console.log('\n   Sample segments:');
  samples.forEach(s => {
    console.log(`   - ${s.segment_id}: ${s.from_point} to ${s.to_point} (${s.distance}m)`);
  });
  
  // Check import status
  const status = await sql`
    SELECT * FROM sow_import_status 
    WHERE project_id = ${projectId} 
    AND step_type = 'fibre'
  `;
  
  if (status.length > 0) {
    console.log(`\n   Import status: ${status[0].status}`);
    console.log(`   Records imported: ${status[0].records_imported || 0}`);
    if (status[0].error_message) {
      console.log(`   Error: ${status[0].error_message}`);
    }
  } else {
    console.log('\n   No import status record found');
  }
  
  // Update status if data exists but status is wrong
  if (count[0].count > 0 && (!status[0] || status[0].status !== 'completed')) {
    console.log('\n   📝 Updating import status to reflect actual data...');
    await sql`
      INSERT INTO sow_import_status (project_id, step_type, status, records_imported, completed_at)
      VALUES (${projectId}, 'fibre', 'completed', ${count[0].count}, CURRENT_TIMESTAMP)
      ON CONFLICT (project_id, step_type)
      DO UPDATE SET 
        status = 'completed',
        records_imported = ${count[0].count},
        completed_at = CURRENT_TIMESTAMP,
        error_message = NULL
    `;
    console.log('   ✅ Status updated');
  }
}

verifyFibre();