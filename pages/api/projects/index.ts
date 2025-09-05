import type { NextApiRequest, NextApiResponse } from 'next';
// import { getAuth } from '@clerk/nextjs/server';
import { getAuth } from '../../../lib/auth-mock';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

type ProjectData = {
  success: boolean;
  data: any;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProjectData>
) {
  // Enable CORS for Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check authentication
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all projects or single project by ID
        if (req.query.id) {
          const project = await sql`
            SELECT p.*, c.client_name 
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id::text::uuid
            WHERE p.id = ${req.query.id}
          `;
          
          if (project.length === 0) {
            return res.status(404).json({ 
              success: false, 
              data: null, 
              message: 'Project not found' 
            });
          }
          
          res.status(200).json({ success: true, data: project[0] });
        } else {
          const projects = await sql`
            SELECT p.*, c.client_name 
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id::text::uuid
            ORDER BY p.created_at DESC NULLS LAST
          `;
          
          // Return empty array if no projects, not an error
          res.status(200).json({ 
            success: true, 
            data: projects || [],
            message: projects.length === 0 ? 'No projects found' : undefined
          });
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
            ${projectData.client_id}, ${projectData.description},
            ${projectData.project_type}, ${projectData.status || 'active'},
            ${projectData.priority || 'medium'}, ${projectData.start_date},
            ${projectData.end_date}, ${projectData.budget},
            ${projectData.project_manager}, ${projectData.location}
          )
          RETURNING *
        `;
        res.status(201).json({ success: true, data: newProject[0] });
        break;

      case 'PUT':
        // Update project
        if (!req.query.id) {
          return res.status(400).json({ success: false, data: null, message: 'Project ID required' });
        }
        
        const updateData = req.body;
        const updatedProject = await sql`
          UPDATE projects SET
            project_name = COALESCE(${updateData.project_name}, project_name),
            client_id = COALESCE(${updateData.client_id}, client_id),
            description = COALESCE(${updateData.description}, description),
            project_type = COALESCE(${updateData.project_type}, project_type),
            status = COALESCE(${updateData.status}, status),
            priority = COALESCE(${updateData.priority}, priority),
            start_date = COALESCE(${updateData.start_date}, start_date),
            end_date = COALESCE(${updateData.end_date}, end_date),
            budget = COALESCE(${updateData.budget}, budget),
            project_manager = COALESCE(${updateData.project_manager}, project_manager),
            location = COALESCE(${updateData.location}, location),
            updated_at = NOW()
          WHERE id = ${req.query.id}
          RETURNING *
        `;
        res.status(200).json({ success: true, data: updatedProject[0] });
        break;

      case 'DELETE':
        // Delete project
        if (!req.query.id) {
          return res.status(400).json({ success: false, data: null, message: 'Project ID required' });
        }
        
        await sql`DELETE FROM projects WHERE id = ${req.query.id}`;
        res.status(200).json({ success: true, data: null, message: 'Project deleted' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, data: null, message: `Method ${req.method} not allowed` });
    }
  } catch (error: any) {
    console.error('Projects API Error:', error);
    res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
}