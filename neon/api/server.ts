/**
 * Local API Server for Neon Database
 * Handles all database operations locally during development
 */

import express from 'express';
import cors from 'cors';
import { sql } from '../config/database.config.js';
import { bulkInsertPoles } from './bulk-insert.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large pole datasets
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT 1 as healthy`;
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Projects API endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const { status, clientId, search } = req.query;
    
    let projects;
    
    if (status && status.includes(',')) {
      // Handle multiple statuses
      const statuses = status.split(',');
      projects = await sql`
        SELECT 
          p.id,
          p.project_code as code,
          p.project_name as name,
          p.client_id as "clientId",
          p.description,
          p.project_type as type,
          p.status,
          p.priority,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.budget,
          p.project_manager as "projectManager",
          p.location,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.company_name as "clientName"
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.status = ANY(${statuses})
        ORDER BY p.created_at DESC
      `;
    } else if (status) {
      // Single status
      projects = await sql`
        SELECT 
          p.id,
          p.project_code as code,
          p.project_name as name,
          p.client_id as "clientId",
          p.description,
          p.project_type as type,
          p.status,
          p.priority,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.budget,
          p.project_manager as "projectManager",
          p.location,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.company_name as "clientName"
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.status = ${status}
        ORDER BY p.created_at DESC
      `;
    } else if (search) {
      // Search by name or code
      const searchPattern = `%${search}%`;
      projects = await sql`
        SELECT 
          p.id,
          p.project_code as code,
          p.project_name as name,
          p.client_id as "clientId",
          p.description,
          p.project_type as type,
          p.status,
          p.priority,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.budget,
          p.project_manager as "projectManager",
          p.location,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.company_name as "clientName"
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.project_name ILIKE ${searchPattern} OR p.project_code ILIKE ${searchPattern}
        ORDER BY p.created_at DESC
      `;
    } else {
      // Get all projects
      projects = await sql`
        SELECT 
          p.id,
          p.project_code as code,
          p.project_name as name,
          p.client_id as "clientId",
          p.description,
          p.project_type as type,
          p.status,
          p.priority,
          p.start_date as "startDate",
          p.end_date as "endDate",
          p.budget,
          p.project_manager as "projectManager",
          p.location,
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          c.company_name as "clientName"
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY p.created_at DESC
      `;
    }
    
    res.json({ 
      success: true, 
      data: projects 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get single project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await sql`
      SELECT 
        p.*,
        c.company_name as client_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = ${id}
    `;
    
    if (project.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: project[0] 
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const projectData = req.body;
    
    const newProject = await sql`
      INSERT INTO projects (
        project_code, 
        project_name, 
        client_id, 
        description, 
        project_type, 
        status, 
        priority, 
        start_date, 
        end_date, 
        budget, 
        project_manager, 
        location
      )
      VALUES (
        ${projectData.project_code}, 
        ${projectData.project_name}, 
        ${projectData.client_id}, 
        ${projectData.description}, 
        ${projectData.project_type}, 
        ${projectData.status || 'ACTIVE'}, 
        ${projectData.priority || 'MEDIUM'}, 
        ${projectData.start_date}, 
        ${projectData.end_date}, 
        ${projectData.budget}, 
        ${projectData.project_manager}, 
        ${projectData.location}
      )
      RETURNING *
    `;
    
    res.status(201).json({ 
      success: true, 
      data: newProject[0] 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedProject = await sql`
      UPDATE projects
      SET 
        project_name = COALESCE(${updates.project_name}, project_name),
        description = COALESCE(${updates.description}, description),
        status = COALESCE(${updates.status}, status),
        priority = COALESCE(${updates.priority}, priority),
        budget = COALESCE(${updates.budget}, budget),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (updatedProject.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedProject[0] 
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedProject = await sql`
      DELETE FROM projects
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (deletedProject.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// SOW API endpoints
app.post('/api/sow/initialize', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    // Check if project exists
    const project = await sql`
      SELECT id FROM projects WHERE id = ${projectId}
    `;
    
    if (project.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    // Ensure fibre_segments table exists
    await sql`
      CREATE TABLE IF NOT EXISTS fibre_segments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        segment_id VARCHAR(200) UNIQUE NOT NULL,
        project_id UUID NOT NULL,
        from_point VARCHAR(100),
        to_point VARCHAR(100),
        distance FLOAT,
        cable_type VARCHAR(50),
        cable_size VARCHAR(50),
        layer VARCHAR(100),
        pon_no INTEGER,
        zone_no INTEGER,
        installation_date DATE,
        status VARCHAR(50) DEFAULT 'planned',
        contractor VARCHAR(100),
        complete VARCHAR(20),
        notes TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Ensure import status tracking table exists
    await sql`
      CREATE TABLE IF NOT EXISTS sow_import_status (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID NOT NULL,
        step_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        records_imported INTEGER DEFAULT 0,
        file_name VARCHAR(255),
        error_message TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        UNIQUE(project_id, step_type)
      )
    `;
    
    res.json({ 
      success: true, 
      message: 'SOW tables ready' 
    });
  } catch (error) {
    console.error('Error initializing SOW:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get import status for a project
app.get('/api/sow/import-status/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const status = await sql`
      SELECT 
        step_type,
        status,
        records_imported,
        file_name,
        error_message,
        started_at,
        completed_at,
        metadata
      FROM sow_import_status
      WHERE project_id = ${projectId}
      ORDER BY 
        CASE step_type
          WHEN 'poles' THEN 1
          WHEN 'drops' THEN 2
          WHEN 'fibre' THEN 3
        END
    `;
    
    res.json({ 
      success: true, 
      data: status
    });
  } catch (error) {
    console.error('Error fetching import status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/sow/poles', async (req, res) => {
  try {
    const { projectId, poles } = req.body;
    
    console.log(`🚀 Fast batch import: ${poles.length} poles for project ${projectId}`);
    const startTime = Date.now();
    
    // Track import status
    await sql`
      INSERT INTO sow_import_status (project_id, step_type, status, started_at)
      VALUES (${projectId}, 'poles', 'in_progress', CURRENT_TIMESTAMP)
      ON CONFLICT (project_id, step_type) 
      DO UPDATE SET 
        status = 'in_progress',
        started_at = CURRENT_TIMESTAMP,
        error_message = NULL
    `;
    
    // Check if we need to add a unique constraint on pole_number
    try {
      await sql`
        ALTER TABLE poles 
        ADD CONSTRAINT poles_pole_number_unique UNIQUE (pole_number)
      `;
      console.log('Added unique constraint on pole_number');
    } catch (e) {
      // Constraint might already exist, that's fine
    }
    
    // Clear existing poles for this project
    await sql`DELETE FROM poles WHERE project_id = ${projectId}`;
    
    // Use optimized batch import with UNNEST (1000 records per batch)
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < poles.length; i += BATCH_SIZE) {
      const batch = poles.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      // Prepare batch data
      const batchData = batch.map(pole => ({
        pole_number: pole.pole_number || pole.label_1 || '',
        project_id: projectId,
        latitude: pole.latitude || pole.lat || 0,
        longitude: pole.longitude || pole.lon || pole.lng || 0,
        status: pole.status || 'planned',
        metadata: JSON.stringify(pole)
      }));
      
      // Use UNNEST for bulk insert
      const result = await sql`
        INSERT INTO poles (pole_number, project_id, latitude, longitude, status, metadata)
        SELECT * FROM UNNEST(
          ${batchData.map(p => p.pole_number)}::text[],
          ${batchData.map(p => p.project_id)}::uuid[],
          ${batchData.map(p => p.latitude)}::float8[],
          ${batchData.map(p => p.longitude)}::float8[],
          ${batchData.map(p => p.status)}::text[],
          ${batchData.map(p => p.metadata)}::jsonb[]
        )
        ON CONFLICT (pole_number) DO UPDATE SET
          project_id = EXCLUDED.project_id,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING pole_number
      `;
      
      totalInserted += result.length;
      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} poles in ${batchTime}s | Progress: ${totalInserted}/${poles.length}`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (totalInserted / parseFloat(totalTime)).toFixed(0);
    
    console.log(`✅ Import complete: ${totalInserted} poles in ${totalTime}s (${rate} poles/sec)`);
    
    // Update import status
    await sql`
      UPDATE sow_import_status 
      SET 
        status = 'completed',
        records_imported = ${totalInserted},
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('duration_seconds', ${totalTime}, 'rate_per_sec', ${rate})
      WHERE project_id = ${projectId} AND step_type = 'poles'
    `;
    
    res.json({ 
      success: true, 
      message: `${totalInserted} poles saved successfully`,
      count: totalInserted
    });
  } catch (error) {
    console.error('Error saving poles:', error);
    
    // Update import status on error
    try {
      await sql`
        UPDATE sow_import_status 
        SET 
          status = 'failed',
          error_message = ${error.message},
          completed_at = CURRENT_TIMESTAMP
        WHERE project_id = ${req.body.projectId} AND step_type = 'poles'
      `;
    } catch (statusError) {
      console.error('Error updating status:', statusError);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/sow/poles', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const poles = await sql`
      SELECT * FROM poles 
      WHERE project_id = ${projectId}
      ORDER BY pole_number
    `;
    
    res.json({ 
      success: true, 
      data: poles,
      count: poles.length
    });
  } catch (error) {
    console.error('Error fetching poles:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DROPS endpoints with fast batch import
app.post('/api/sow/drops', async (req, res) => {
  try {
    const { projectId, drops } = req.body;
    
    console.log(`🚀 Fast batch import: ${drops.length} drops for project ${projectId}`);
    const startTime = Date.now();
    
    // Track import status
    await sql`
      INSERT INTO sow_import_status (project_id, step_type, status, started_at)
      VALUES (${projectId}, 'drops', 'in_progress', CURRENT_TIMESTAMP)
      ON CONFLICT (project_id, step_type) 
      DO UPDATE SET 
        status = 'in_progress',
        started_at = CURRENT_TIMESTAMP,
        error_message = NULL
    `;
    
    // Clear existing drops for this project
    await sql`DELETE FROM drops WHERE project_id = ${projectId}`;
    
    // Use optimized batch import with UNNEST (1000 records per batch)
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < drops.length; i += BATCH_SIZE) {
      const batch = drops.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      // Prepare batch data
      const batchData = batch.map(drop => ({
        drop_number: drop.drop_number || drop.drop_id || '',
        pole_number: drop.pole_number || drop.pole_id || '',
        project_id: projectId,
        address: drop.address || drop.installation_address || '',
        status: drop.status || 'planned',
        metadata: JSON.stringify(drop)
      }));
      
      // Use UNNEST for bulk insert
      const result = await sql`
        INSERT INTO drops (drop_number, pole_number, project_id, address, status, metadata)
        SELECT * FROM UNNEST(
          ${batchData.map(d => d.drop_number)}::text[],
          ${batchData.map(d => d.pole_number)}::text[],
          ${batchData.map(d => d.project_id)}::uuid[],
          ${batchData.map(d => d.address)}::text[],
          ${batchData.map(d => d.status)}::text[],
          ${batchData.map(d => d.metadata)}::jsonb[]
        )
        ON CONFLICT (drop_number) DO UPDATE SET
          pole_number = EXCLUDED.pole_number,
          project_id = EXCLUDED.project_id,
          address = EXCLUDED.address,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING drop_number
      `;
      
      totalInserted += result.length;
      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} drops in ${batchTime}s | Progress: ${totalInserted}/${drops.length}`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (totalInserted / parseFloat(totalTime)).toFixed(0);
    
    console.log(`✅ Import complete: ${totalInserted} drops in ${totalTime}s (${rate} drops/sec)`);
    
    // Update import status
    await sql`
      UPDATE sow_import_status 
      SET 
        status = 'completed',
        records_imported = ${totalInserted},
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('duration_seconds', ${totalTime}, 'rate_per_sec', ${rate})
      WHERE project_id = ${projectId} AND step_type = 'drops'
    `;
    
    res.json({ 
      success: true, 
      message: `${totalInserted} drops saved successfully`,
      count: totalInserted
    });
  } catch (error) {
    console.error('Error saving drops:', error);
    
    // Update import status on error
    try {
      await sql`
        UPDATE sow_import_status 
        SET 
          status = 'failed',
          error_message = ${error.message},
          completed_at = CURRENT_TIMESTAMP
        WHERE project_id = ${req.body.projectId} AND step_type = 'drops'
      `;
    } catch (statusError) {
      console.error('Error updating status:', statusError);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/sow/drops', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const drops = await sql`
      SELECT * FROM drops 
      WHERE project_id = ${projectId}
      ORDER BY drop_number
    `;
    
    res.json({ 
      success: true, 
      data: drops,
      count: drops.length
    });
  } catch (error) {
    console.error('Error fetching drops:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// FIBRE endpoints with fast batch import  
app.post('/api/sow/fibre', async (req, res) => {
  try {
    const { projectId, fibres } = req.body;
    
    console.log(`🚀 Fast batch import: ${fibres.length} fibre segments for project ${projectId}`);
    const startTime = Date.now();
    
    // Track import status
    await sql`
      INSERT INTO sow_import_status (project_id, step_type, status, started_at)
      VALUES (${projectId}, 'fibre', 'in_progress', CURRENT_TIMESTAMP)
      ON CONFLICT (project_id, step_type) 
      DO UPDATE SET 
        status = 'in_progress',
        started_at = CURRENT_TIMESTAMP,
        error_message = NULL
    `;
    
    // Clear existing fibre for this project
    await sql`DELETE FROM fibre_segments WHERE project_id = ${projectId}`;
    
    // Remove duplicates before processing
    const uniqueFibres = fibres.reduce((acc: any[], fibre: any) => {
      const segmentId = fibre.segment_id || fibre.cable_id || '';
      if (!acc.some(f => (f.segment_id || f.cable_id) === segmentId)) {
        acc.push(fibre);
      }
      return acc;
    }, []);
    
    console.log(`Filtered ${fibres.length - uniqueFibres.length} duplicate segments`);
    
    // Use optimized batch import with UNNEST (1000 records per batch)
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    
    for (let i = 0; i < uniqueFibres.length; i += BATCH_SIZE) {
      const batch = uniqueFibres.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();
      
      // Prepare batch data
      const batchData = batch.map(fibre => ({
        segment_id: fibre.segment_id || fibre.cable_id || '',
        project_id: projectId,
        from_point: fibre.from_point || fibre.start_point || '',
        to_point: fibre.to_point || fibre.end_point || '',
        distance: parseFloat(fibre.distance || fibre.length || 0),
        cable_type: fibre.cable_type || fibre.type || 'standard',
        status: fibre.status || 'planned',
        metadata: JSON.stringify(fibre)
      }));
      
      // Use UNNEST for bulk insert
      const result = await sql`
        INSERT INTO fibre_segments (segment_id, project_id, from_point, to_point, distance, cable_type, status, metadata)
        SELECT * FROM UNNEST(
          ${batchData.map(f => f.segment_id)}::text[],
          ${batchData.map(f => f.project_id)}::uuid[],
          ${batchData.map(f => f.from_point)}::text[],
          ${batchData.map(f => f.to_point)}::text[],
          ${batchData.map(f => f.distance)}::float8[],
          ${batchData.map(f => f.cable_type)}::text[],
          ${batchData.map(f => f.status)}::text[],
          ${batchData.map(f => f.metadata)}::jsonb[]
        )
        ON CONFLICT (segment_id) DO UPDATE SET
          project_id = EXCLUDED.project_id,
          from_point = EXCLUDED.from_point,
          to_point = EXCLUDED.to_point,
          distance = EXCLUDED.distance,
          cable_type = EXCLUDED.cable_type,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING segment_id
      `;
      
      totalInserted += result.length;
      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} fibre segments in ${batchTime}s | Progress: ${totalInserted}/${uniqueFibres.length}`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (totalInserted / parseFloat(totalTime)).toFixed(0);
    
    console.log(`✅ Import complete: ${totalInserted} fibre segments in ${totalTime}s (${rate} segments/sec)`);
    
    // Update import status
    await sql`
      UPDATE sow_import_status 
      SET 
        status = 'completed',
        records_imported = ${totalInserted},
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('duration_seconds', ${totalTime}, 'rate_per_sec', ${rate})
      WHERE project_id = ${projectId} AND step_type = 'fibre'
    `;
    
    res.json({ 
      success: true, 
      message: `${totalInserted} fibre segments saved successfully`,
      count: totalInserted
    });
  } catch (error) {
    console.error('Error saving fibre:', error);
    
    // Update import status on error
    try {
      await sql`
        UPDATE sow_import_status 
        SET 
          status = 'failed',
          error_message = ${error.message},
          completed_at = CURRENT_TIMESTAMP
        WHERE project_id = ${req.body.projectId} AND step_type = 'fibre'
      `;
    } catch (statusError) {
      console.error('Error updating status:', statusError);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/sow/fibre', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const fibres = await sql`
      SELECT * FROM fibre_segments 
      WHERE project_id = ${projectId}
      ORDER BY segment_id
    `;
    
    res.json({ 
      success: true, 
      data: fibres,
      count: fibres.length
    });
  } catch (error) {
    console.error('Error fetching fibre:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Neon API Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;