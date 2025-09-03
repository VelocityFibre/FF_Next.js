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
        // Get all projects or single project by ID
        if (req.query.id) {
          const project = await sql`
            SELECT p.*, c.company_name as client_name 
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            WHERE p.id = ${req.query.id}
          `;
          res.status(200).json({ success: true, data: project[0] || null });
        } else {
          const projects = await sql`
            SELECT p.*, c.company_name as client_name 
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            ORDER BY p.created_at DESC
          `;
          res.status(200).json({ success: true, data: projects });
        }
        break;

      case 'POST':
        // Create new project
        const projectData = req.body;
        const newProject = await sql`
          INSERT INTO projects (
            project_code, project_name, client_id, description, 
            project_type, status, priority, start_date, end_date, 
            budget, project_manager, location
          )
          VALUES (
            ${projectData.project_code}, ${projectData.project_name}, 
            ${projectData.client_id}::uuid, ${projectData.description},
            ${projectData.project_type}, ${projectData.status || 'planning'}, 
            ${projectData.priority || 'medium'}, ${projectData.start_date}, 
            ${projectData.end_date}, ${projectData.budget || 0},
            ${projectData.project_manager}::uuid, ${projectData.location}
          )
          RETURNING *
        `;
        res.status(201).json({ success: true, data: newProject[0] });
        break;

      case 'PUT':
        // Update project
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Project ID required' });
        }
        const updates = req.body;
        const updatedProject = await sql`
          UPDATE projects 
          SET project_name = ${updates.project_name},
              description = ${updates.description},
              status = ${updates.status},
              budget = ${updates.budget},
              updated_at = NOW()
          WHERE id = ${req.query.id}
          RETURNING *
        `;
        res.status(200).json({ success: true, data: updatedProject[0] });
        break;

      case 'DELETE':
        // Delete project and related SOW data
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Project ID required' });
        }
        
        const projectId = req.query.id;
        
        try {
          // Delete related SOW data first (to avoid foreign key constraints)
          // Try to delete from each table, ignore if table doesn't exist
          
          try {
            await sql`DELETE FROM sow_drops WHERE project_id = ${projectId}`;
            console.log('Deleted SOW drops data');
          } catch (e) {
            // Table might not exist or no data, continue
            console.log('No drops data to delete');
          }
          
          try {
            await sql`DELETE FROM sow_poles WHERE project_id = ${projectId}`;
            console.log('Deleted SOW poles data');
          } catch (e) {
            // Table might not exist or no data, continue
            console.log('No poles data to delete');
          }
          
          try {
            await sql`DELETE FROM sow_fibre WHERE project_id = ${projectId}`;
            console.log('Deleted SOW fibre data');
          } catch (e) {
            // Table might not exist or no data, continue
            console.log('No fibre data to delete');
          }
          
          try {
            await sql`DELETE FROM sow_project_summary WHERE project_id = ${projectId}`;
            console.log('Deleted SOW project summary');
          } catch (e) {
            // Table might not exist or no data, continue
            console.log('No project summary to delete');
          }
          
          try {
            await sql`DELETE FROM sow_import_status WHERE project_id = ${projectId}`;
            console.log('Deleted SOW import status');
          } catch (e) {
            // Table might not exist or no data, continue
            console.log('No import status to delete');
          }
          
          // Now delete the project
          const result = await sql`DELETE FROM projects WHERE id = ${projectId} RETURNING id`;
          
          if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Project not found' });
          }
          
          res.status(200).json({ 
            success: true, 
            message: 'Project and related data deleted successfully',
            deletedId: result[0].id 
          });
        } catch (error) {
          console.error('Delete project error:', error);
          throw error; // Let the outer catch handle it
        }
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}