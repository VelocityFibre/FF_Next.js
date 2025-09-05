import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(express.json());

// GET /api/clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await sql`
      SELECT 
        id,
        client_code,
        client_name,
        status,
        created_at
      FROM clients
      ORDER BY client_name ASC
    `;
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await sql`
      SELECT 
        p.*,
        c.client_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `;
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/staff
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await sql`
      SELECT 
        id,
        employee_id,
        first_name,
        last_name,
        department,
        created_at
      FROM staff
      ORDER BY last_name, first_name
    `;
    res.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sow
app.get('/api/sow', async (req, res) => {
  try {
    const sowImports = await sql`
      SELECT 
        si.*,
        p.project_name,
        c.client_name
      FROM sow_imports si
      LEFT JOIN projects p ON si.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY si.created_at DESC
      LIMIT 100
    `;
    res.json({ success: true, data: sowImports });
  } catch (error) {
    console.error('Error fetching SOW imports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sow/summary
app.get('/api/sow/summary', async (req, res) => {
  try {
    const summary = await sql`
      SELECT 
        COUNT(DISTINCT project_id) as total_projects,
        COUNT(*) as total_imports,
        COUNT(DISTINCT import_id) as unique_imports,
        SUM(total_poles) as total_poles,
        SUM(total_drops) as total_drops,
        MAX(created_at) as last_import
      FROM sow_imports
    `;
    res.json({ success: true, data: summary[0] });
  } catch (error) {
    console.error('Error fetching SOW summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/clients/:id
app.delete('/api/clients/:id', async (req, res) => {
  const clientId = req.params.id;
  
  try {
    // Check for associated projects
    const associatedProjects = await sql`
      SELECT COUNT(*) as count FROM projects WHERE client_id = ${clientId}
    `;
    
    if (associatedProjects[0]?.count > 0) {
      return res.status(409).json({ 
        success: false, 
        error: `Cannot delete client. Client has ${associatedProjects[0].count} associated project(s).`
      });
    }
    
    // Delete the client
    const result = await sql`
      DELETE FROM clients WHERE id = ${clientId} RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    
    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as time`;
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result[0].time 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Database connected to:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown');
  console.log('\nAvailable endpoints:');
  console.log('  GET    /api/clients');
  console.log('  DELETE /api/clients/:id');
  console.log('  GET    /api/projects');
  console.log('  GET    /api/staff');
  console.log('  GET    /api/sow');
  console.log('  GET    /api/sow/summary');
  console.log('  GET    /api/health');
});