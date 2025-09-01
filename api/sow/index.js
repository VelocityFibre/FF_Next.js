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
    // Extract the action from the URL path
    const { action, projectId } = req.query;

    switch (req.method) {
      case 'GET':
        if (projectId && !action) {
          // GET /api/sow?projectId=xxx - Get all SOW data for a project
          return await handleGetProjectSOW(req, res, projectId);
        }
        return res.status(400).json({ success: false, error: 'Invalid GET request' });

      case 'POST':
        if (!action) {
          return res.status(400).json({ success: false, error: 'Action required for POST requests' });
        }

        switch (action) {
          case 'initialize':
            // POST /api/sow?action=initialize
            return await handleInitializeTables(req, res);
          case 'poles':
            // POST /api/sow?action=poles
            return await handleUploadPoles(req, res);
          case 'drops':
            // POST /api/sow?action=drops
            return await handleUploadDrops(req, res);
          case 'fibre':
            // POST /api/sow?action=fibre
            return await handleUploadFibre(req, res);
          default:
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Initialize SOW tables for a project
async function handleInitializeTables(req, res) {
  const { projectId } = req.body;
  
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }

  try {
    // Create poles table
    await sql`
      CREATE TABLE IF NOT EXISTS sow_poles (
        id SERIAL PRIMARY KEY,
        project_id UUID NOT NULL,
        pole_number VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        status VARCHAR(100) DEFAULT 'pending',
        pole_type VARCHAR(100),
        pole_spec VARCHAR(255),
        height VARCHAR(50),
        diameter VARCHAR(50),
        owner VARCHAR(100),
        pon_no INTEGER,
        zone_no INTEGER,
        address TEXT,
        municipality VARCHAR(255),
        created_date TIMESTAMP,
        created_by VARCHAR(100),
        comments TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, pole_number)
      )
    `;

    // Create drops table
    await sql`
      CREATE TABLE IF NOT EXISTS sow_drops (
        id SERIAL PRIMARY KEY,
        project_id UUID NOT NULL,
        drop_number VARCHAR(255) NOT NULL,
        pole_number VARCHAR(255),
        cable_type VARCHAR(100),
        cable_spec VARCHAR(255),
        cable_length VARCHAR(50),
        cable_capacity VARCHAR(50),
        start_point VARCHAR(255),
        end_point VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        pon_no INTEGER,
        zone_no INTEGER,
        municipality VARCHAR(255),
        status VARCHAR(100) DEFAULT 'planned',
        created_date TIMESTAMP,
        created_by VARCHAR(100),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, drop_number)
      )
    `;

    // Create fibre table
    await sql`
      CREATE TABLE IF NOT EXISTS sow_fibre (
        id SERIAL PRIMARY KEY,
        project_id UUID NOT NULL,
        segment_id VARCHAR(255) NOT NULL,
        cable_size VARCHAR(50),
        layer VARCHAR(100),
        distance DECIMAL(10, 2),
        pon_no INTEGER,
        zone_no INTEGER,
        string_completed DECIMAL(10, 2),
        date_completed DATE,
        contractor VARCHAR(100),
        status VARCHAR(100) DEFAULT 'planned',
        is_complete BOOLEAN DEFAULT FALSE,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, segment_id)
      )
    `;

    // Create or update project summary
    await sql`
      INSERT INTO sow_project_summary (project_id, project_name, total_poles, total_drops, total_fibre_segments, total_fibre_length)
      VALUES (${projectId}::uuid, '', 0, 0, 0, 0)
      ON CONFLICT (project_id) DO NOTHING
    `;

    res.status(200).json({ 
      success: true, 
      message: 'SOW tables initialized successfully',
      tables: ['sow_poles', 'sow_drops', 'sow_fibre', 'sow_project_summary']
    });
  } catch (error) {
    console.error('Error initializing SOW tables:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Upload poles data
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

    for (const pole of poles) {
      try {
        // Check if pole already exists
        const existing = await sql`
          SELECT id FROM sow_poles 
          WHERE project_id = ${projectId}::uuid 
          AND pole_number = ${pole.pole_number}
        `;

        if (existing.length > 0) {
          // Update existing pole
          await sql`
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
          `;
          updatedCount++;
        } else {
          // Insert new pole
          await sql`
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
          `;
          insertedCount++;
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
      summary: summary[0]
    });
  } catch (error) {
    console.error('Error uploading poles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Upload drops data
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

    for (const drop of drops) {
      try {
        // Check if drop already exists
        const existing = await sql`
          SELECT id FROM sow_drops 
          WHERE project_id = ${projectId}::uuid 
          AND drop_number = ${drop.drop_number}
        `;

        if (existing.length > 0) {
          // Update existing drop
          await sql`
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
          `;
          updatedCount++;
        } else {
          // Insert new drop
          await sql`
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
          `;
          insertedCount++;
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
      summary: summary[0]
    });
  } catch (error) {
    console.error('Error uploading drops:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Upload fibre data
async function handleUploadFibre(req, res) {
  const { projectId, fibre } = req.body;
  
  if (!projectId || !fibre || !Array.isArray(fibre)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Project ID and fibre array required' 
    });
  }

  try {
    let insertedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const segment of fibre) {
      try {
        // Check if fibre segment already exists
        const existing = await sql`
          SELECT id FROM sow_fibre 
          WHERE project_id = ${projectId}::uuid 
          AND segment_id = ${segment.segment_id}
        `;

        if (existing.length > 0) {
          // Update existing fibre segment
          await sql`
            UPDATE sow_fibre 
            SET cable_size = ${segment.cable_size},
                layer = ${segment.layer},
                distance = ${segment.length || segment.distance},
                pon_no = ${segment.pon_no},
                zone_no = ${segment.zone_no},
                string_completed = ${segment.string_completed},
                date_completed = ${segment.date_completed},
                contractor = ${segment.contractor},
                status = ${segment.status || 'planned'},
                is_complete = ${segment.is_complete || false},
                raw_data = ${JSON.stringify(segment.raw_data || {})},
                updated_at = NOW()
            WHERE project_id = ${projectId}::uuid 
            AND segment_id = ${segment.segment_id}
          `;
          updatedCount++;
        } else {
          // Insert new fibre segment
          await sql`
            INSERT INTO sow_fibre (
              project_id, segment_id, cable_size, layer, distance,
              pon_no, zone_no, string_completed, date_completed,
              contractor, status, is_complete, raw_data
            )
            VALUES (
              ${projectId}::uuid, ${segment.segment_id}, ${segment.cable_size},
              ${segment.layer}, ${segment.length || segment.distance},
              ${segment.pon_no}, ${segment.zone_no}, ${segment.string_completed},
              ${segment.date_completed}, ${segment.contractor},
              ${segment.status || 'planned'}, ${segment.is_complete || false},
              ${JSON.stringify(segment.raw_data || {})}
            )
          `;
          insertedCount++;
        }
      } catch (error) {
        errors.push({
          segment_id: segment.segment_id,
          error: error.message
        });
      }
    }

    // Update project summary
    const summary = await sql`
      UPDATE sow_project_summary 
      SET total_fibre_segments = (
        SELECT COUNT(*) FROM sow_fibre WHERE project_id = ${projectId}::uuid
      ),
      total_fibre_length = (
        SELECT COALESCE(SUM(distance), 0) FROM sow_fibre WHERE project_id = ${projectId}::uuid
      ),
      last_updated = NOW()
      WHERE project_id = ${projectId}::uuid
      RETURNING *
    `;

    res.status(200).json({ 
      success: true, 
      message: `Fibre upload completed`,
      inserted: insertedCount,
      updated: updatedCount,
      errors: errors,
      summary: summary[0]
    });
  } catch (error) {
    console.error('Error uploading fibre:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get all SOW data for a project
async function handleGetProjectSOW(req, res, projectId) {
  try {
    // Get poles
    const poles = await sql`
      SELECT * FROM sow_poles 
      WHERE project_id = ${projectId}::uuid 
      ORDER BY pole_number
    `;

    // Get drops
    const drops = await sql`
      SELECT * FROM sow_drops 
      WHERE project_id = ${projectId}::uuid 
      ORDER BY drop_number
    `;

    // Get fibre
    const fibre = await sql`
      SELECT * FROM sow_fibre 
      WHERE project_id = ${projectId}::uuid 
      ORDER BY segment_id
    `;

    // Get project summary
    const summary = await sql`
      SELECT * FROM sow_project_summary 
      WHERE project_id = ${projectId}::uuid
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
      data: {
        poles: poles,
        drops: drops,
        fibre: fibre,
        summary: summary[0] || {
          total_poles: poles.length,
          total_drops: drops.length,
          total_fibre_segments: fibre.length,
          total_fibre_length: fibre.reduce((sum, f) => sum + (parseFloat(f.distance) || 0), 0)
        },
        polesWithDropCount: polesWithDropCount
      }
    });
  } catch (error) {
    console.error('Error fetching SOW data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}