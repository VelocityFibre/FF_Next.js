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
        // Get fibre segments for a project
        const { projectId, contractor, status } = req.query;
        if (!projectId) {
          return res.status(400).json({ success: false, error: 'Project ID required' });
        }
        
        let fibreSegments;
        
        if (contractor || status) {
          // Filter by contractor or status
          const conditions = [`project_id = ${projectId}::uuid`];
          if (contractor) conditions.push(`contractor = ${contractor}`);
          if (status) conditions.push(`status = ${status}`);
          
          fibreSegments = await sql`
            SELECT * FROM sow_fibre 
            WHERE project_id = ${projectId}::uuid
            ${contractor ? sql`AND contractor = ${contractor}` : sql``}
            ${status ? sql`AND status = ${status}` : sql``}
            ORDER BY segment_id
          `;
        } else {
          // Get all fibre segments
          fibreSegments = await sql`
            SELECT * FROM sow_fibre 
            WHERE project_id = ${projectId}::uuid 
            ORDER BY segment_id
          `;
        }
        
        // Calculate statistics
        const stats = await sql`
          SELECT 
            COUNT(*) as total_segments,
            COALESCE(SUM(distance), 0) as total_distance,
            COUNT(CASE WHEN is_complete = true THEN 1 END) as completed_segments,
            COALESCE(SUM(CASE WHEN is_complete = true THEN distance END), 0) as completed_distance
          FROM sow_fibre 
          WHERE project_id = ${projectId}::uuid
        `;
        
        res.status(200).json({ 
          success: true, 
          data: fibreSegments,
          count: fibreSegments.length,
          stats: stats[0]
        });
        break;

      case 'POST':
        // Upload fibre data
        return await handleUploadFibre(req, res);

      case 'PUT':
        // Update single fibre segment
        return await handleUpdateFibre(req, res);

      case 'DELETE':
        // Delete fibre segment(s)
        return await handleDeleteFibre(req, res);

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

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
    const processedSegments = [];

    for (const segment of fibre) {
      try {
        // Validate required fields
        if (!segment.segment_id) {
          errors.push({
            segment_id: segment.segment_id || 'unknown',
            error: 'Segment ID is required'
          });
          continue;
        }

        // Check if fibre segment already exists
        const existing = await sql`
          SELECT id FROM sow_fibre 
          WHERE project_id = ${projectId}::uuid 
          AND segment_id = ${segment.segment_id}
        `;

        if (existing.length > 0) {
          // Update existing fibre segment
          const updated = await sql`
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
            RETURNING *
          `;
          updatedCount++;
          processedSegments.push(updated[0]);
        } else {
          // Insert new fibre segment
          const inserted = await sql`
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
            RETURNING *
          `;
          insertedCount++;
          processedSegments.push(inserted[0]);
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
      processedSegments: processedSegments,
      summary: summary[0]
    });
  } catch (error) {
    console.error('Error uploading fibre:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdateFibre(req, res) {
  const { id } = req.query;
  const updates = req.body;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'Fibre segment ID required' });
  }

  try {
    const updatedSegment = await sql`
      UPDATE sow_fibre 
      SET cable_size = ${updates.cable_size},
          layer = ${updates.layer},
          distance = ${updates.distance},
          string_completed = ${updates.string_completed},
          date_completed = ${updates.date_completed},
          contractor = ${updates.contractor},
          status = ${updates.status},
          is_complete = ${updates.is_complete},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedSegment.length === 0) {
      return res.status(404).json({ success: false, error: 'Fibre segment not found' });
    }

    // Update project summary if distance changed
    if (updates.distance !== undefined) {
      await sql`
        UPDATE sow_project_summary 
        SET total_fibre_length = (
          SELECT COALESCE(SUM(distance), 0) FROM sow_fibre 
          WHERE project_id = ${updatedSegment[0].project_id}
        ),
        last_updated = NOW()
        WHERE project_id = ${updatedSegment[0].project_id}
      `;
    }

    res.status(200).json({ success: true, data: updatedSegment[0] });
  } catch (error) {
    console.error('Error updating fibre segment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleDeleteFibre(req, res) {
  const { id, projectId, segmentIds } = req.query;
  
  try {
    let deletedCount = 0;
    
    if (id) {
      // Delete single fibre segment by ID
      const result = await sql`
        DELETE FROM sow_fibre WHERE id = ${id}
      `;
      deletedCount = 1;
    } else if (projectId && segmentIds) {
      // Delete multiple segments by segment IDs
      const ids = Array.isArray(segmentIds) ? segmentIds : [segmentIds];
      const result = await sql`
        DELETE FROM sow_fibre 
        WHERE project_id = ${projectId}::uuid 
        AND segment_id = ANY(${ids})
      `;
      deletedCount = ids.length;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Either segment ID or project ID with segment IDs required' 
      });
    }

    // Update project summary if project ID is provided
    if (projectId) {
      await sql`
        UPDATE sow_project_summary 
        SET total_fibre_segments = (
          SELECT COUNT(*) FROM sow_fibre WHERE project_id = ${projectId}::uuid
        ),
        total_fibre_length = (
          SELECT COALESCE(SUM(distance), 0) FROM sow_fibre WHERE project_id = ${projectId}::uuid
        ),
        last_updated = NOW()
        WHERE project_id = ${projectId}::uuid
      `;
    }

    res.status(200).json({ 
      success: true, 
      message: `${deletedCount} fibre segment(s) deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting fibre segments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}