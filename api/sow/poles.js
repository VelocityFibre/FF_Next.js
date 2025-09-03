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
        return await handleUploadPoles(req, res, sql);

      case 'PUT':
        // Update single pole
        return await handleUpdatePole(req, res, sql);

      case 'DELETE':
        // Delete pole(s)
        return await handleDeletePoles(req, res, sql);

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUploadPoles(req, res, sql) {
  const { projectId, poles } = req.body;
  
  if (!projectId || !poles || !Array.isArray(poles)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Project ID and poles array required' 
    });
  }

  const BATCH_SIZE = 500; // More conservative batch size for API use
  
  try {
    let insertedCount = 0;
    let updatedCount = 0;
    const errors = [];
    const processedPoles = [];
    
    // Filter valid poles
    const validPoles = poles.filter(pole => {
      // Check for pole number in various possible field names
      const poleNumber = pole.pole_number || pole.label_1 || pole.Label_1 || pole['Pole Number'] || pole.pole || pole.label;
      if (!poleNumber) {
        errors.push({
          pole_number: pole.pole_number || pole.label_1 || 'unknown',
          error: 'Pole number is required'
        });
        return false;
      }
      return true;
    });
    
    console.log(`Processing ${validPoles.length} valid poles in batches of ${BATCH_SIZE}`);
    
    // Process in batches using multi-value INSERT (more efficient than UNNEST)
    for (let i = 0; i < validPoles.length; i += BATCH_SIZE) {
      const batch = validPoles.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      try {
        // Build multi-value INSERT query
        const values = [];
        const placeholders = [];
        
        let valueIndex = 1;
        batch.forEach((pole, rowIndex) => {
          // Handle various Excel column mapping patterns
          const poleNumber = pole.pole_number || pole.label_1 || pole.Label_1 || pole['Pole Number'] || pole.pole;
          const latitude = parseFloat(pole.latitude || pole.lat || pole.Lat) || null;
          const longitude = parseFloat(pole.longitude || pole.lon || pole.Lon) || null;
          const owner = pole.owner || pole.cmpownr || null;
          const ponNo = parseInt(pole.pon_no || pole['PON No'] || pole.pon) || null;
          const zoneNo = parseInt(pole.zone_no || pole['Zone No'] || pole.zone) || null;
          const createdDate = pole.created_date || pole.datecrtd ? new Date(pole.created_date || pole.datecrtd) : null;
          const createdBy = pole.created_by || pole.cmpownr || null;
          
          // Build placeholders for this row (18 columns)
          const rowPlaceholders = [];
          for (let j = 0; j < 18; j++) {
            rowPlaceholders.push(`$${valueIndex++}`);
          }
          placeholders.push(`(${rowPlaceholders.join(', ')})`);
          
          // Add values matching sow_poles table structure
          values.push(
            projectId,                                    // project_id
            poleNumber,                                   // pole_number
            latitude,                                     // latitude
            longitude,                                    // longitude
            pole.status || 'pending',                    // status
            pole.pole_type || null,                      // pole_type
            pole.pole_spec || null,                      // pole_spec
            parseFloat(pole.height) || null,             // height
            parseFloat(pole.diameter) || null,           // diameter
            owner,                                       // owner
            ponNo,                                       // pon_no
            zoneNo,                                      // zone_no
            pole.address || null,                        // address
            pole.municipality || null,                   // municipality
            createdDate,                                 // created_date
            createdBy,                                   // created_by
            pole.comments || null,                       // comments
            JSON.stringify(pole.raw_data || pole)       // raw_data (store original data)
          );
        });
        
        if (placeholders.length === 0) {
          continue;
        }
        
        // Execute efficient multi-value INSERT
        const query = `
          INSERT INTO sow_poles (
            project_id, pole_number, latitude, longitude, status,
            pole_type, pole_spec, height, diameter, owner,
            pon_no, zone_no, address, municipality,
            created_date, created_by, comments, raw_data
          ) VALUES ${placeholders.join(', ')}
          ON CONFLICT (project_id, pole_number) DO UPDATE SET
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            status = EXCLUDED.status,
            pole_type = EXCLUDED.pole_type,
            pole_spec = EXCLUDED.pole_spec,
            height = EXCLUDED.height,
            diameter = EXCLUDED.diameter,
            owner = EXCLUDED.owner,
            pon_no = EXCLUDED.pon_no,
            zone_no = EXCLUDED.zone_no,
            address = EXCLUDED.address,
            municipality = EXCLUDED.municipality,
            created_date = EXCLUDED.created_date,
            created_by = EXCLUDED.created_by,
            comments = EXCLUDED.comments,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()
          RETURNING id, pole_number
        `;
        
        const result = await sql(query, values);
        insertedCount += result.length;
        processedPoles.push(...result);
        
        const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
        const rate = Math.round(result.length / parseFloat(batchTime));
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} poles in ${batchTime}s (${rate}/sec)`);
        
      } catch (batchError) {
        console.error(`Batch error at index ${i}:`, batchError);
        // Add all poles from failed batch to errors
        batch.forEach(pole => {
          errors.push({
            pole_number: pole.pole_number,
            error: batchError.message
          });
        });
      }
    }

    // Update project summary if table exists
    try {
      const summary = await sql`
        UPDATE sow_project_summary 
        SET total_poles = (
          SELECT COUNT(*) FROM sow_poles WHERE project_id = ${projectId}::uuid
        ),
        last_updated = NOW()
        WHERE project_id = ${projectId}::uuid
        RETURNING *
      `;
    } catch (summaryError) {
      console.log('Project summary update skipped:', summaryError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: `Poles upload completed`,
      inserted: insertedCount,
      updated: 0, // We can't distinguish inserts from updates with ON CONFLICT
      errors: errors,
      totalProcessed: processedPoles.length,
      summary: null
    });
  } catch (error) {
    console.error('Error uploading poles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdatePole(req, res, sql) {
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

async function handleDeletePoles(req, res, sql) {
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