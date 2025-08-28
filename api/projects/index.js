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
            project_type, status, start_date, end_date, budget
          )
          VALUES (
            ${projectData.project_code}, ${projectData.project_name}, 
            ${projectData.client_id}, ${projectData.description},
            ${projectData.project_type}, ${projectData.status || 'planning'}, 
            ${projectData.start_date}, ${projectData.end_date}, ${projectData.budget}
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
        // Delete project
        if (!req.query.id) {
          return res.status(400).json({ success: false, error: 'Project ID required' });
        }
        await sql`DELETE FROM projects WHERE id = ${req.query.id}`;
        res.status(200).json({ success: true, message: 'Project deleted successfully' });
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}