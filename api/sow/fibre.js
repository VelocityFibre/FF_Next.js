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
        return await handleUploadFibre(req, res, sql);

      case 'PUT':
        // Update single fibre segment
        return await handleUpdateFibre(req, res, sql);

      case 'DELETE':
        // Delete fibre segment(s)
        return await handleDeleteFibre(req, res, sql);

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUploadFibre(req, res, sql) {
  const { projectId, fibre } = req.body;
  
  if (!projectId || !fibre || !Array.isArray(fibre)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Project ID and fibre array required' 
    });
  }

  const BATCH_SIZE = 500; // More conservative batch size for API use
  
  try {
    let insertedCount = 0;
    let updatedCount = 0;
    const errors = [];
    const processedSegments = [];
    
    // Filter valid fibre segments
    const validSegments = fibre.filter(segment => {
      if (!segment.segment_id) {
        errors.push({
          segment_id: segment.segment_id || 'unknown',
          error: 'Segment ID is required'
        });
        return false;
      }
      return true;
    });
    
    console.log(`Processing ${validSegments.length} valid fibre segments in batches of ${BATCH_SIZE}`);
    
    // Process in batches
    for (let i = 0; i < validSegments.length; i += BATCH_SIZE) {
      const batch = validSegments.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      try {
        // Build multi-value INSERT query (more efficient than UNNEST)
        const values = [];
        const placeholders = [];
        
        let valueIndex = 1;
        batch.forEach((segment, rowIndex) => {
          // Handle various Excel column mapping patterns
          const segmentId = segment.segment_id || segment.segment || segment['Segment ID'] || segment.id || '';
          const cableSize = segment.cable_size || segment.size || segment['Cable Size'] || null;
          const layer = segment.layer || segment.Layer || null;
          const distance = parseFloat(segment.distance || segment.length || segment.Length) || null;
          const ponNo = segment.pon_no || segment['PON No'] || segment.pon || null;
          const zoneNo = segment.zone_no || segment['Zone No'] || segment.zone || null;
          const stringCompleted = segment.string_completed || segment.completed || null;
          const dateCompleted = segment.date_completed || segment.completed_date ? new Date(segment.date_completed || segment.completed_date) : null;
          const contractor = segment.contractor || segment.Contractor || null;
          const isComplete = segment.is_complete || segment.complete || false;
          
          // Build placeholders for this row (13 columns)
          const rowPlaceholders = [];
          for (let j = 0; j < 13; j++) {
            rowPlaceholders.push(`$${valueIndex++}`);
          }
          placeholders.push(`(${rowPlaceholders.join(', ')})`);
          
          // Add values matching sow_fibre table structure
          values.push(
            projectId,                                    // project_id
            segmentId,                                    // segment_id
            cableSize,                                    // cable_size
            layer,                                        // layer
            distance,                                     // distance
            ponNo,                                        // pon_no
            zoneNo,                                       // zone_no
            stringCompleted,                              // string_completed
            dateCompleted,                                // date_completed
            contractor,                                   // contractor
            segment.status || 'planned',                 // status
            isComplete,                                   // is_complete
            JSON.stringify(segment.raw_data || segment)  // raw_data (store original data)
          );
        });
        
        if (placeholders.length === 0) {
          continue;
        }
        
        // Execute efficient multi-value INSERT
        const query = `
          INSERT INTO sow_fibre (
            project_id, segment_id, cable_size, layer, distance,
            pon_no, zone_no, string_completed, date_completed,
            contractor, status, is_complete, raw_data
          ) VALUES ${placeholders.join(', ')}
          ON CONFLICT (project_id, segment_id) DO UPDATE SET
            cable_size = EXCLUDED.cable_size,
            layer = EXCLUDED.layer,
            distance = EXCLUDED.distance,
            pon_no = EXCLUDED.pon_no,
            zone_no = EXCLUDED.zone_no,
            string_completed = EXCLUDED.string_completed,
            date_completed = EXCLUDED.date_completed,
            contractor = EXCLUDED.contractor,
            status = EXCLUDED.status,
            is_complete = EXCLUDED.is_complete,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()
          RETURNING id, segment_id, project_id,
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
          processedSegments.push(row);
        });
        
        const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
        const rate = Math.round(result.length / parseFloat(batchTime));
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} fibre segments in ${batchTime}s (${rate}/sec)`);
        
      } catch (batchError) {
        console.error(`Batch error at index ${i}:`, batchError);
        // Add all segments from failed batch to errors
        batch.forEach(segment => {
          errors.push({
            segment_id: segment.segment_id,
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
      summary = summaryResult[0];
    } catch (summaryError) {
      console.log('Project summary update skipped:', summaryError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: `Fibre upload completed`,
      inserted: insertedCount,
      updated: updatedCount,
      errors: errors,
      processedSegments: processedSegments,
      summary: summary
    });
  } catch (error) {
    console.error('Error uploading fibre:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdateFibre(req, res, sql) {
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

async function handleDeleteFibre(req, res, sql) {
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