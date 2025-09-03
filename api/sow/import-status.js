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

  // Extract project ID from URL path
  // URL format: /api/sow/import-status/[projectId]
  const urlParts = req.url.split('/');
  const projectId = urlParts[urlParts.length - 1];

  if (!projectId || projectId === 'import-status') {
    return res.status(400).json({ 
      success: false, 
      error: 'Project ID is required' 
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get import status for a project
        const status = await sql`
          SELECT * FROM sow_import_status
          WHERE project_id = ${projectId}
          ORDER BY started_at DESC
          LIMIT 1
        `;
        
        if (status.length === 0) {
          // No import status found - return a default status
          return res.status(200).json({
            success: true,
            data: {
              project_id: projectId,
              status: 'not_started',
              step_type: 'none',
              records_imported: 0,
              file_name: '',
              error_message: null,
              started_at: new Date().toISOString(),
              completed_at: null,
              metadata: {}
            }
          });
        }
        
        res.status(200).json({ 
          success: true, 
          data: status[0] 
        });
        break;

      case 'POST':
        // Create or update import status
        const { 
          step_type, 
          status: importStatus, 
          records_imported, 
          file_name, 
          error_message,
          metadata 
        } = req.body;
        
        // Insert new status record
        const newStatus = await sql`
          INSERT INTO sow_import_status (
            id,
            project_id, 
            step_type,
            status, 
            records_imported,
            file_name,
            error_message,
            started_at,
            completed_at,
            metadata
          )
          VALUES (
            gen_random_uuid(),
            ${projectId},
            ${step_type || 'upload'},
            ${importStatus || 'in_progress'},
            ${records_imported || 0},
            ${file_name || ''},
            ${error_message || null},
            NOW(),
            ${importStatus === 'completed' ? 'NOW()' : null},
            ${metadata || {}}::jsonb
          )
          RETURNING *
        `;
        
        res.status(201).json({ 
          success: true, 
          data: newStatus[0] 
        });
        break;

      default:
        res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('Import status API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}