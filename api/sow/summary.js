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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { projectId } = req.query;

  try {
    if (projectId) {
      // Get summary for specific project
      const summary = await sql`
        SELECT 
          ps.*,
          p.project_name,
          p.project_code,
          p.status as project_status
        FROM sow_project_summary ps
        LEFT JOIN projects p ON ps.project_id = p.id
        WHERE ps.project_id = ${projectId}::uuid
      `;

      if (summary.length === 0) {
        // If no summary exists, calculate it from actual data
        const calculatedSummary = await sql`
          SELECT 
            ${projectId}::uuid as project_id,
            (SELECT project_name FROM projects WHERE id = ${projectId}::uuid) as project_name,
            (SELECT COUNT(*) FROM sow_poles WHERE project_id = ${projectId}::uuid) as total_poles,
            (SELECT COUNT(*) FROM sow_drops WHERE project_id = ${projectId}::uuid) as total_drops,
            (SELECT COUNT(*) FROM sow_fibre WHERE project_id = ${projectId}::uuid) as total_fibre_segments,
            (SELECT COALESCE(SUM(distance), 0) FROM sow_fibre WHERE project_id = ${projectId}::uuid) as total_fibre_length,
            NOW() as last_updated
        `;

        return res.status(200).json({ 
          success: true, 
          data: calculatedSummary[0],
          calculated: true
        });
      }

      res.status(200).json({ 
        success: true, 
        data: summary[0]
      });
    } else {
      // Get summary for all projects with SOW data
      const allSummaries = await sql`
        SELECT 
          ps.*,
          p.project_name,
          p.project_code,
          p.client_id,
          p.status as project_status,
          c.company_name as client_name
        FROM sow_project_summary ps
        LEFT JOIN projects p ON ps.project_id = p.id
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY ps.last_updated DESC
      `;

      // Get overall statistics
      const overallStats = await sql`
        SELECT 
          COUNT(DISTINCT project_id) as total_projects,
          SUM(total_poles) as total_poles,
          SUM(total_drops) as total_drops,
          SUM(total_fibre_segments) as total_fibre_segments,
          SUM(total_fibre_length) as total_fibre_length
        FROM sow_project_summary
      `;

      res.status(200).json({ 
        success: true, 
        data: {
          projects: allSummaries,
          overall: overallStats[0] || {
            total_projects: 0,
            total_poles: 0,
            total_drops: 0,
            total_fibre_segments: 0,
            total_fibre_length: 0
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching SOW summary:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}