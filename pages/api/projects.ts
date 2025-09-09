import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '@/lib/api-error-handler';
import { createLoggedSql, logCreate, logUpdate, logDelete } from '@/lib/db-logger';
import { apiLogger } from '@/lib/logger';

const sql = createLoggedSql(process.env.DATABASE_URL!);

// API route handler for projects CRUD operations
export default withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // CORS handled by withErrorHandler - no need for manual headers
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
})

// GET /api/projects - Fetch all projects or single project by ID
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id, search, status, client_id, limit = 50, offset = 0 } = req.query;
  
  try {
    // Fetch single project by ID
    if (id) {
      const project = await sql`
        SELECT 
          p.*,
          c.name as client_name,
          s.name as manager_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN staff s ON p.project_manager_id = s.id
        WHERE p.id = ${id as string}
      `;
      
      if (project.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      return res.status(200).json({ success: true, data: project[0] });
    }
    
    // Build query with filters
    let query = `
      SELECT 
        p.*,
        c.name as client_name,
        s.name as manager_name,
        COUNT(DISTINCT t.id) as task_count
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN staff s ON p.project_manager_id = s.id
      LEFT JOIN project_tasks t ON p.id = t.project_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (LOWER(p.name) LIKE LOWER($${paramIndex}) OR LOWER(p.description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (client_id) {
      query += ` AND p.client_id = $${paramIndex}`;
      params.push(client_id);
      paramIndex++;
    }
    
    query += ` GROUP BY p.id, c.name, s.name ORDER BY p.created_at DESC`;
    
    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(Number(limit));
      paramIndex++;
    }
    
    if (offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(Number(offset));
    }
    
    const projects = params.length > 0 
      ? await sql.call(null, query, params)
      : await sql(query);
    
    return res.status(200).json({ success: true, data: projects || [] });
  } catch (error) {
    apiLogger.error({ error, method: 'GET', path: '/api/projects' }, 'Failed to fetch projects');
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/projects - Create new project
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const projectData = req.body;
    
    // Validate required fields
    if (!projectData.name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const newProject = await sql`
      INSERT INTO projects (
        name, description, client_id, project_manager_id,
        status, priority, start_date, end_date,
        budget_allocated, budget_spent,
        municipal_district, gps_latitude, gps_longitude,
        city, state
      )
      VALUES (
        ${projectData.name},
        ${projectData.description || null},
        ${projectData.client_id || projectData.clientId || null},
        ${projectData.project_manager_id || projectData.projectManagerId || null},
        ${projectData.status || 'PLANNING'},
        ${projectData.priority || 'MEDIUM'},
        ${projectData.start_date || projectData.startDate || new Date().toISOString()},
        ${projectData.end_date || projectData.endDate || null},
        ${projectData.budget_allocated || projectData.budgetAllocated || 0},
        ${projectData.budget_spent || projectData.budgetSpent || 0},
        ${projectData.municipal_district || projectData.municipalDistrict || null},
        ${projectData.gps_latitude || projectData.gpsLatitude || null},
        ${projectData.gps_longitude || projectData.gpsLongitude || null},
        ${projectData.city || null},
        ${projectData.state || null}
      )
      RETURNING *
    `;
    
    // Log successful project creation
    if (newProject[0]) {
      logCreate('project', newProject[0].id, {
        project_code: newProject[0].project_code,
        project_name: newProject[0].project_name,
        client_id: newProject[0].client_id
      });
    }
    
    return res.status(201).json({ success: true, data: newProject[0] });
  } catch (error) {
    apiLogger.error({ error, method: 'POST', path: '/api/projects' }, 'Failed to create project');
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/projects - Update existing project
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  try {
    const updates = req.body;
    
    const updatedProject = await sql`
      UPDATE projects
      SET 
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        client_id = COALESCE(${updates.client_id || updates.clientId}, client_id),
        project_manager_id = COALESCE(${updates.project_manager_id || updates.projectManagerId}, project_manager_id),
        status = COALESCE(${updates.status}, status),
        priority = COALESCE(${updates.priority}, priority),
        start_date = COALESCE(${updates.start_date || updates.startDate}, start_date),
        end_date = COALESCE(${updates.end_date || updates.endDate}, end_date),
        budget_allocated = COALESCE(${updates.budget_allocated || updates.budgetAllocated}, budget_allocated),
        budget_spent = COALESCE(${updates.budget_spent || updates.budgetSpent}, budget_spent),
        municipal_district = COALESCE(${updates.municipal_district || updates.municipalDistrict}, municipal_district),
        gps_latitude = COALESCE(${updates.gps_latitude || updates.gpsLatitude}, gps_latitude),
        gps_longitude = COALESCE(${updates.gps_longitude || updates.gpsLongitude}, gps_longitude),
        city = COALESCE(${updates.city}, city),
        state = COALESCE(${updates.state}, state),
        updated_at = NOW()
      WHERE id = ${id as string}
      RETURNING *
    `;
    
    if (updatedProject.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.status(200).json({ success: true, data: updatedProject[0] });
  } catch (error) {
    apiLogger.error({ error, method: 'PUT', path: '/api/projects', projectId: id }, 'Failed to update project');
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/projects - Delete project
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  try {
    const deleted = await sql`
      DELETE FROM projects
      WHERE id = ${id as string}
      RETURNING id
    `;
    
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    apiLogger.error({ error, method: 'DELETE', path: '/api/projects', projectId: id }, 'Failed to delete project');
    return res.status(500).json({ error: 'Internal server error' });
  }
}