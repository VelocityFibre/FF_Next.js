/**
 * SQL queries for pole operations
 */

export const POLE_QUERIES = {
  getPolesByProject: `
    SELECT 
      p.*,
      COUNT(d.id) as drop_count
    FROM sow_poles p
    LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
    WHERE p.project_id = $1
    GROUP BY p.id
    ORDER BY p.pole_number
  `,

  getPoleById: `
    SELECT 
      p.*,
      COUNT(d.id) as drop_count
    FROM sow_poles p
    LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
    WHERE p.id = $1
    GROUP BY p.id
  `,

  searchPolesBase: `
    SELECT 
      p.*,
      COUNT(d.id) as drop_count
    FROM sow_poles p
    LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
    WHERE 1=1
  `,

  updatePoleStatus: `
    UPDATE sow_poles 
    SET status = $1, updated_at = NOW()
    WHERE id = $2
  `,

  updatePolePhoto: `
    UPDATE sow_poles 
    SET {columnName} = $1, updated_at = NOW()
    WHERE id = $2
  `,

  getProjectStatistics: `
    SELECT 
      COUNT(*) as total_poles,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_poles,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_poles,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_poles,
      COUNT(CASE WHEN status = 'issue' THEN 1 END) as issue_poles,
      AVG(CASE 
        WHEN quality_pole_condition IS NOT NULL THEN 
          (quality_pole_condition::int + 
           COALESCE(quality_cable_routing::int, 0) +
           COALESCE(quality_connector::int, 0) +
           COALESCE(quality_labeling::int, 0) +
           COALESCE(quality_grounding::int, 0) +
           COALESCE(quality_height::int, 0) +
           COALESCE(quality_tension::int, 0) +
           COALESCE(quality_documentation::int, 0)) * 100.0 / 8
        ELSE NULL 
      END) as average_quality_score
    FROM sow_poles
    WHERE project_id = $1
  `,

  bulkImportPoles: `
    INSERT INTO sow_poles (pole_number, project_id, location, status)
    VALUES {values}
    ON CONFLICT (pole_number, project_id) DO UPDATE
    SET location = EXCLUDED.location,
        updated_at = NOW()
  `,

  getPendingSync: `
    SELECT * FROM sow_poles 
    WHERE project_id = $1 AND sync_status = $2
  `
};