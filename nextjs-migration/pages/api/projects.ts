import { NextApiRequest, NextApiResponse } from 'next';
// import { getAuth } from '@clerk/nextjs/server';
import { db, projects, Project, NewProject, safeQuery } from '@/lib/db';
import { eq, desc, and, ilike } from 'drizzle-orm';

// API route handler for projects CRUD operations
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For testing: use mock user ID
  // TODO: Re-enable Clerk authentication
  const userId = 'test-user-123';
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, userId);
    case 'POST':
      return handlePost(req, res, userId);
    case 'PUT':
      return handlePut(req, res, userId);
    case 'DELETE':
      return handleDelete(req, res, userId);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

// GET /api/projects - Fetch all projects or single project by ID
async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id, search, status, limit = 50, offset = 0 } = req.query;
  
  try {
    // Fetch single project by ID
    if (id) {
      const result = await safeQuery(
        async () => await db.select().from(projects).where(eq(projects.id, Number(id))).limit(1),
        'Failed to fetch project'
      );
      
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }
      
      const project = result.data?.[0];
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      return res.status(200).json(project);
    }
    
    // Build query conditions
    const conditions: any[] = [];
    if (status && typeof status === 'string') {
      conditions.push(eq(projects.status, status));
    }
    if (search && typeof search === 'string') {
      conditions.push(ilike(projects.name, `%${search}%`));
    }
    
    // Fetch projects with filters
    const result = await safeQuery(
      async () => {
        const query = db.select().from(projects);
        if (conditions.length > 0) {
          query.where(and(...conditions));
        }
        return await query
          .orderBy(desc(projects.createdAt))
          .limit(Number(limit))
          .offset(Number(offset));
      },
      'Failed to fetch projects'
    );
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    return res.status(200).json(result.data || []);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/projects - Create new project
async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const projectData: NewProject = {
      ...req.body,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Validate required fields
    if (!projectData.name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const result = await safeQuery(
      async () => await db.insert(projects).values(projectData).returning(),
      'Failed to create project'
    );
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    return res.status(201).json(result.data?.[0]);
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/projects - Update existing project
async function handlePut(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    
    const result = await safeQuery(
      async () => await db.update(projects)
        .set(updateData)
        .where(eq(projects.id, Number(id)))
        .returning(),
      'Failed to update project'
    );
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    if (!result.data?.[0]) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.status(200).json(result.data[0]);
  } catch (error) {
    console.error('Error in PUT /api/projects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/projects - Delete project
async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  try {
    const result = await safeQuery(
      async () => await db.delete(projects)
        .where(eq(projects.id, Number(id)))
        .returning(),
      'Failed to delete project'
    );
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    if (!result.data?.[0]) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/projects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}