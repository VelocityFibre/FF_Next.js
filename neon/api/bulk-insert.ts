/**
 * Optimized bulk insert for large datasets
 */

import { sql } from '../config/database.config.js';

export async function bulkInsertPoles(projectId: string, poles: any[]) {
  console.log(`Starting bulk insert of ${poles.length} poles...`);
  
  // Clear existing poles for this project
  await sql`DELETE FROM poles WHERE project_id = ${projectId}`;
  
  // Process in reasonable batches for performance
  const BATCH_SIZE = 500;
  let totalInserted = 0;
  
  for (let i = 0; i < poles.length; i += BATCH_SIZE) {
    const batch = poles.slice(i, i + BATCH_SIZE);
    
    // Build VALUES string for this batch
    const values = batch.map(pole => [
      pole.pole_number || pole.label_1,
      projectId,
      pole.latitude || pole.lat || 0,
      pole.longitude || pole.lon || pole.lng || 0,
      pole.status || 'planned',
      JSON.stringify(pole)
    ]);
    
    // Use postgres.js array insert syntax
    const result = await sql`
      INSERT INTO poles (pole_number, project_id, latitude, longitude, status, metadata)
      VALUES ${sql(values)}
      ON CONFLICT (pole_number) DO UPDATE SET
        project_id = EXCLUDED.project_id,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        status = EXCLUDED.status,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
      RETURNING pole_number
    `;
    
    totalInserted += result.length;
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted ${result.length} poles (Total: ${totalInserted}/${poles.length})`);
  }
  
  console.log(`Successfully inserted ${totalInserted} poles in total`);
  return { length: totalInserted };
}