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
        // Get poles for a project
        const { projectId } = req.query;
        if (!projectId) {
          return res.status(400).json({ success: false, error: 'Project ID required' });
        }
        
        const poles = await sql`
          SELECT * FROM sow_poles 
          WHERE project_id = ${projectId}::uuid 
          ORDER BY pole_number
        `;
        
        // Get poles with drop count
        const polesWithDropCount = await sql`
          SELECT 
            p.*,
            COUNT(d.id) as connected_drops,
            ARRAY_AGG(d.drop_number) FILTER (WHERE d.drop_number IS NOT NULL) as drop_numbers
          FROM sow_poles p
          LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
          WHERE p.project_id = ${projectId}::uuid
          GROUP BY p.id
          ORDER BY p.pole_number
        `;
        
        res.status(200).json({ 
          success: true, 
          data: poles,
          polesWithDropCount: polesWithDropCount,
          count: poles.length
        });
        break;

      case 'POST':
        // Upload poles data
        return await handleUploadPoles(req, res);

      case 'PUT':
        // Update single pole
        return await handleUpdatePole(req, res);

      case 'DELETE':
        // Delete pole(s)
        return await handleDeletePoles(req, res);

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUploadPoles(req, res) {
  const { projectId, poles } = req.body;
  
  if (!projectId || !poles || !Array.isArray(poles)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Project ID and poles array required' 
    });
  }

  try {
    let insertedCount = 0;
    let updatedCount = 0;
    const errors = [];
    const processedPoles = [];

    for (const pole of poles) {
      try {
        // Validate required fields
        if (!pole.pole_number) {
          errors.push({
            pole_number: pole.pole_number || 'unknown',
            error: 'Pole number is required'
          });
          continue;
        }

        // Check if pole already exists
        const existing = await sql`
          SELECT id FROM sow_poles 
          WHERE project_id = ${projectId}::uuid 
          AND pole_number = ${pole.pole_number}
        `;

        if (existing.length > 0) {
          // Update existing pole
          const updated = await sql`
            UPDATE sow_poles 
            SET latitude = ${pole.latitude},
                longitude = ${pole.longitude},
                status = ${pole.status || 'pending'},
                pole_type = ${pole.pole_type},
                pole_spec = ${pole.pole_spec},
                height = ${pole.height},
                diameter = ${pole.diameter},
                owner = ${pole.owner},
                pon_no = ${pole.pon_no},
                zone_no = ${pole.zone_no},
                address = ${pole.address},
                municipality = ${pole.municipality},
                created_date = ${pole.created_date},
                created_by = ${pole.created_by},
                comments = ${pole.comments},
                raw_data = ${JSON.stringify(pole.raw_data || {})},
                updated_at = NOW()
            WHERE project_id = ${projectId}::uuid 
            AND pole_number = ${pole.pole_number}
            RETURNING *
          `;
          updatedCount++;
          processedPoles.push(updated[0]);
        } else {
          // Insert new pole
          const inserted = await sql`
            INSERT INTO sow_poles (
              project_id, pole_number, latitude, longitude, status,
              pole_type, pole_spec, height, diameter, owner,
              pon_no, zone_no, address, municipality,
              created_date, created_by, comments, raw_data
            )
            VALUES (
              ${projectId}::uuid, ${pole.pole_number}, ${pole.latitude}, 
              ${pole.longitude}, ${pole.status || 'pending'},
              ${pole.pole_type}, ${pole.pole_spec}, ${pole.height}, 
              ${pole.diameter}, ${pole.owner},
              ${pole.pon_no}, ${pole.zone_no}, ${pole.address}, 
              ${pole.municipality}, ${pole.created_date}, 
              ${pole.created_by}, ${pole.comments}, 
              ${JSON.stringify(pole.raw_data || {})}
            )
            RETURNING *
          `;
          insertedCount++;
          processedPoles.push(inserted[0]);
        }
      } catch (error) {
        errors.push({
          pole_number: pole.pole_number,
          error: error.message
        });
      }
    }

    // Update project summary
    const summary = await sql`
      UPDATE sow_project_summary 
      SET total_poles = (
        SELECT COUNT(*) FROM sow_poles WHERE project_id = ${projectId}::uuid
      ),
      last_updated = NOW()
      WHERE project_id = ${projectId}::uuid
      RETURNING *
    `;

    res.status(200).json({ 
      success: true, 
      message: `Poles upload completed`,
      inserted: insertedCount,
      updated: updatedCount,
      errors: errors,
      processedPoles: processedPoles,
      summary: summary[0]
    });
  } catch (error) {
    console.error('Error uploading poles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdatePole(req, res) {
  const { id } = req.query;
  const updates = req.body;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'Pole ID required' });
  }

  try {
    const updatedPole = await sql`
      UPDATE sow_poles 
      SET latitude = ${updates.latitude},
          longitude = ${updates.longitude},
          status = ${updates.status},
          pole_type = ${updates.pole_type},
          pole_spec = ${updates.pole_spec},
          height = ${updates.height},
          diameter = ${updates.diameter},
          owner = ${updates.owner},
          address = ${updates.address},
          municipality = ${updates.municipality},
          comments = ${updates.comments},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedPole.length === 0) {
      return res.status(404).json({ success: false, error: 'Pole not found' });
    }

    res.status(200).json({ success: true, data: updatedPole[0] });
  } catch (error) {
    console.error('Error updating pole:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleDeletePoles(req, res) {
  const { id, projectId, poleNumbers } = req.query;
  
  try {
    let deletedCount = 0;
    
    if (id) {
      // Delete single pole by ID
      const result = await sql`
        DELETE FROM sow_poles WHERE id = ${id}
      `;
      deletedCount = 1;
    } else if (projectId && poleNumbers) {
      // Delete multiple poles by pole numbers
      const numbers = Array.isArray(poleNumbers) ? poleNumbers : [poleNumbers];
      const result = await sql`
        DELETE FROM sow_poles 
        WHERE project_id = ${projectId}::uuid 
        AND pole_number = ANY(${numbers})
      `;
      deletedCount = numbers.length;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Either pole ID or project ID with pole numbers required' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `${deletedCount} pole(s) deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting poles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}