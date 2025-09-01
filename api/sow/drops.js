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
        return await handleUploadDrops(req, res);

      case 'PUT':
        // Update single drop
        return await handleUpdateDrop(req, res);

      case 'DELETE':
        // Delete drop(s)
        return await handleDeleteDrops(req, res);

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUploadDrops(req, res) {
  const { projectId, drops } = req.body;
  
  if (!projectId || !drops || !Array.isArray(drops)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Project ID and drops array required' 
    });
  }

  try {
    let insertedCount = 0;
    let updatedCount = 0;
    const errors = [];
    const processedDrops = [];

    for (const drop of drops) {
      try {
        // Validate required fields
        if (!drop.drop_number) {
          errors.push({
            drop_number: drop.drop_number || 'unknown',
            error: 'Drop number is required'
          });
          continue;
        }

        // Check if drop already exists
        const existing = await sql`
          SELECT id FROM sow_drops 
          WHERE project_id = ${projectId}::uuid 
          AND drop_number = ${drop.drop_number}
        `;

        if (existing.length > 0) {
          // Update existing drop
          const updated = await sql`
            UPDATE sow_drops 
            SET pole_number = ${drop.pole_number},
                cable_type = ${drop.cable_type},
                cable_spec = ${drop.cable_spec},
                cable_length = ${drop.cable_length},
                cable_capacity = ${drop.cable_capacity},
                start_point = ${drop.start_point},
                end_point = ${drop.end_point},
                latitude = ${drop.latitude},
                longitude = ${drop.longitude},
                address = ${drop.address},
                pon_no = ${drop.pon_no},
                zone_no = ${drop.zone_no},
                municipality = ${drop.municipality},
                status = ${drop.status || 'planned'},
                created_date = ${drop.created_date},
                created_by = ${drop.created_by},
                raw_data = ${JSON.stringify(drop.raw_data || {})},
                updated_at = NOW()
            WHERE project_id = ${projectId}::uuid 
            AND drop_number = ${drop.drop_number}
            RETURNING *
          `;
          updatedCount++;
          processedDrops.push(updated[0]);
        } else {
          // Insert new drop
          const inserted = await sql`
            INSERT INTO sow_drops (
              project_id, drop_number, pole_number, cable_type, cable_spec,
              cable_length, cable_capacity, start_point, end_point,
              latitude, longitude, address, pon_no, zone_no,
              municipality, status, created_date, created_by, raw_data
            )
            VALUES (
              ${projectId}::uuid, ${drop.drop_number}, ${drop.pole_number},
              ${drop.cable_type}, ${drop.cable_spec}, ${drop.cable_length},
              ${drop.cable_capacity}, ${drop.start_point}, ${drop.end_point},
              ${drop.latitude}, ${drop.longitude}, ${drop.address},
              ${drop.pon_no}, ${drop.zone_no}, ${drop.municipality},
              ${drop.status || 'planned'}, ${drop.created_date},
              ${drop.created_by}, ${JSON.stringify(drop.raw_data || {})}
            )
            RETURNING *
          `;
          insertedCount++;
          processedDrops.push(inserted[0]);
        }
      } catch (error) {
        errors.push({
          drop_number: drop.drop_number,
          error: error.message
        });
      }
    }

    // Update project summary
    const summary = await sql`
      UPDATE sow_project_summary 
      SET total_drops = (
        SELECT COUNT(*) FROM sow_drops WHERE project_id = ${projectId}::uuid
      ),
      last_updated = NOW()
      WHERE project_id = ${projectId}::uuid
      RETURNING *
    `;

    res.status(200).json({ 
      success: true, 
      message: `Drops upload completed`,
      inserted: insertedCount,
      updated: updatedCount,
      errors: errors,
      processedDrops: processedDrops,
      summary: summary[0]
    });
  } catch (error) {
    console.error('Error uploading drops:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdateDrop(req, res) {
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

async function handleDeleteDrops(req, res) {
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