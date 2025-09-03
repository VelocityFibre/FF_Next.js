import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get drops for a project
        const { projectId, poleNumber } = req.query;
        if (!projectId) {
          return res.status(400).json({ success: false, error: 'Project ID required' });
        }
        
        let query = sql`
          SELECT * FROM sow_drops 
          WHERE project_id = ${projectId}::uuid
        `;
        
        if (poleNumber) {
          // Get drops for specific pole
          const drops = await sql`
            SELECT * FROM sow_drops 
            WHERE project_id = ${projectId}::uuid 
            AND pole_number = ${poleNumber}
            ORDER BY drop_number
          `;
          res.status(200).json({ 
            success: true, 
            data: drops,
            count: drops.length,
            poleNumber: poleNumber
          });
        } else {
          // Get all drops
          const drops = await sql`
            SELECT * FROM sow_drops 
            WHERE project_id = ${projectId}::uuid 
            ORDER BY drop_number
          `;
          res.status(200).json({ 
            success: true, 
            data: drops,
            count: drops.length
          });
        }
        break;

      case 'POST':
        // Upload drops data
        return await handleUploadDrops(req, res, sql);

      case 'PUT':
        // Update single drop
        return await handleUpdateDrop(req, res, sql);

      case 'DELETE':
        // Delete drop(s)
        return await handleDeleteDrops(req, res, sql);

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUploadDrops(req, res, sql) {
  const { projectId, drops } = req.body;
  
  if (!projectId || !drops || !Array.isArray(drops)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Project ID and drops array required' 
    });
  }

  const BATCH_SIZE = 500; // More conservative batch size for API use
  
  try {
    let insertedCount = 0;
    let updatedCount = 0;
    const errors = [];
    const processedDrops = [];
    
    // Filter valid drops
    const validDrops = drops.filter(drop => {
      if (!drop.drop_number) {
        errors.push({
          drop_number: drop.drop_number || 'unknown',
          error: 'Drop number is required'
        });
        return false;
      }
      return true;
    });
    
    console.log(`Processing ${validDrops.length} valid drops in batches of ${BATCH_SIZE}`);
    
    // Process in batches
    for (let i = 0; i < validDrops.length; i += BATCH_SIZE) {
      const batch = validDrops.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      try {
        // Build multi-value INSERT query (more efficient than UNNEST)
        const values = [];
        const placeholders = [];
        
        let valueIndex = 1;
        batch.forEach((drop, rowIndex) => {
          // Handle various Excel column mapping patterns
          const dropNumber = drop.drop_number || drop.drop || drop['Drop Number'] || drop.label || '';
          const poleNumber = drop.pole_number || drop.pole || drop['Pole Number'] || drop.pole_ref || null;
          const latitude = parseFloat(drop.latitude || drop.lat || drop.Lat) || null;
          const longitude = parseFloat(drop.longitude || drop.lon || drop.Lon) || null;
          const ponNo = drop.pon_no || drop['PON No'] || drop.pon || null;
          const zoneNo = drop.zone_no || drop['Zone No'] || drop.zone || null;
          const cableLength = parseFloat(drop.cable_length || drop.length || drop['Cable Length']) || null;
          const cableCapacity = parseInt(drop.cable_capacity || drop.capacity) || null;
          const createdDate = drop.created_date || drop.datecrtd ? new Date(drop.created_date || drop.datecrtd) : null;
          const createdBy = drop.created_by || drop.creator || null;
          
          // Build placeholders for this row (19 columns)
          const rowPlaceholders = [];
          for (let j = 0; j < 19; j++) {
            rowPlaceholders.push(`$${valueIndex++}`);
          }
          placeholders.push(`(${rowPlaceholders.join(', ')})`);
          
          // Add values matching sow_drops table structure
          values.push(
            projectId,                                    // project_id
            dropNumber,                                   // drop_number
            poleNumber,                                   // pole_number
            drop.cable_type || null,                     // cable_type
            drop.cable_spec || null,                     // cable_spec
            cableLength,                                 // cable_length
            cableCapacity,                               // cable_capacity
            drop.start_point || null,                    // start_point
            drop.end_point || null,                      // end_point
            latitude,                                    // latitude
            longitude,                                   // longitude
            drop.address || null,                        // address
            ponNo,                                       // pon_no
            zoneNo,                                      // zone_no
            drop.municipality || null,                   // municipality
            drop.status || 'planned',                    // status
            createdDate,                                 // created_date
            createdBy,                                   // created_by
            JSON.stringify(drop.raw_data || drop)       // raw_data (store original data)
          );
        });
        
        if (placeholders.length === 0) {
          continue;
        }
        
        // Execute efficient multi-value INSERT
        const query = `
          INSERT INTO sow_drops (
            project_id, drop_number, pole_number, cable_type, cable_spec,
            cable_length, cable_capacity, start_point, end_point,
            latitude, longitude, address, pon_no, zone_no,
            municipality, status, created_date, created_by, raw_data
          ) VALUES ${placeholders.join(', ')}
          ON CONFLICT (project_id, drop_number) DO UPDATE SET
            pole_number = EXCLUDED.pole_number,
            cable_type = EXCLUDED.cable_type,
            cable_spec = EXCLUDED.cable_spec,
            cable_length = EXCLUDED.cable_length,
            cable_capacity = EXCLUDED.cable_capacity,
            start_point = EXCLUDED.start_point,
            end_point = EXCLUDED.end_point,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            address = EXCLUDED.address,
            pon_no = EXCLUDED.pon_no,
            zone_no = EXCLUDED.zone_no,
            municipality = EXCLUDED.municipality,
            status = EXCLUDED.status,
            created_date = EXCLUDED.created_date,
            created_by = EXCLUDED.created_by,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()
          RETURNING id, drop_number, project_id,
            CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END as operation
        `;
        
        const result = await sql(query, values);
        
        // Count inserts vs updates
        result.forEach(row => {
          if (row.operation === 'inserted') {
            insertedCount++;
          } else {
            updatedCount++;
          }
          processedDrops.push(row);
        });
        
        const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
        const rate = Math.round(result.length / parseFloat(batchTime));
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} drops in ${batchTime}s (${rate}/sec)`);
        
      } catch (batchError) {
        console.error(`Batch error at index ${i}:`, batchError);
        // Add all drops from failed batch to errors
        batch.forEach(drop => {
          errors.push({
            drop_number: drop.drop_number,
            error: batchError.message
          });
        });
      }
    }

    // Update project summary if table exists
    let summary = null;
    try {
      const summaryResult = await sql`
        UPDATE sow_project_summary 
        SET total_drops = (
          SELECT COUNT(*) FROM sow_drops WHERE project_id = ${projectId}::uuid
        ),
        last_updated = NOW()
        WHERE project_id = ${projectId}::uuid
        RETURNING *
      `;
      summary = summaryResult[0];
    } catch (summaryError) {
      console.log('Project summary update skipped:', summaryError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: `Drops upload completed`,
      inserted: insertedCount,
      updated: updatedCount,
      errors: errors,
      processedDrops: processedDrops,
      summary: summary
    });
  } catch (error) {
    console.error('Error uploading drops:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdateDrop(req, res, sql) {
  const { id } = req.query;
  const updates = req.body;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'Drop ID required' });
  }

  try {
    const updatedDrop = await sql`
      UPDATE sow_drops 
      SET pole_number = ${updates.pole_number},
          cable_type = ${updates.cable_type},
          cable_spec = ${updates.cable_spec},
          cable_length = ${updates.cable_length},
          cable_capacity = ${updates.cable_capacity},
          start_point = ${updates.start_point},
          end_point = ${updates.end_point},
          latitude = ${updates.latitude},
          longitude = ${updates.longitude},
          address = ${updates.address},
          status = ${updates.status},
          municipality = ${updates.municipality},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedDrop.length === 0) {
      return res.status(404).json({ success: false, error: 'Drop not found' });
    }

    res.status(200).json({ success: true, data: updatedDrop[0] });
  } catch (error) {
    console.error('Error updating drop:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleDeleteDrops(req, res, sql) {
  const { id, projectId, dropNumbers } = req.query;
  
  try {
    let deletedCount = 0;
    
    if (id) {
      // Delete single drop by ID
      const result = await sql`
        DELETE FROM sow_drops WHERE id = ${id}
      `;
      deletedCount = 1;
    } else if (projectId && dropNumbers) {
      // Delete multiple drops by drop numbers
      const numbers = Array.isArray(dropNumbers) ? dropNumbers : [dropNumbers];
      const result = await sql`
        DELETE FROM sow_drops 
        WHERE project_id = ${projectId}::uuid 
        AND drop_number = ANY(${numbers})
      `;
      deletedCount = numbers.length;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Either drop ID or project ID with drop numbers required' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `${deletedCount} drop(s) deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting drops:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}