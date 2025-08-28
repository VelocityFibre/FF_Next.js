const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { neon } = require('@neondatabase/serverless');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Get database URL from environment config
const getDatabaseUrl = () => {
  // In production, use Firebase config
  const config = functions.config();
  if (config.database && config.database.url) {
    return config.database.url;
  }
  // Fallback to environment variable
  return process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aRNLhZc1G2CD@ep-dry-night-a9qyh4sj-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require';
};

// Create Neon connection
const sql = neon(getDatabaseUrl());

// Helper function to handle CORS and authentication
const handleRequest = (handler) => {
  return functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
      try {
        // Optional: Add authentication check here
        // const token = req.headers.authorization;
        // if (token) {
        //   const decodedToken = await admin.auth().verifyIdToken(token.replace('Bearer ', ''));
        //   req.user = decodedToken;
        // }
        
        await handler(req, res);
      } catch (error) {
        console.error('Function error:', error);
        res.status(500).json({ 
          error: 'Internal server error',
          message: error.message 
        });
      }
    });
  });
};

// API Endpoints

// Get all clients
exports.getClients = handleRequest(async (req, res) => {
  try {
    const clients = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get client by ID
exports.getClient = handleRequest(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Client ID required' });
  }
  
  try {
    const client = await sql`SELECT * FROM clients WHERE id = ${id}`;
    res.json({ success: true, data: client[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create client
exports.createClient = handleRequest(async (req, res) => {
  const clientData = req.body;
  
  try {
    const result = await sql`
      INSERT INTO clients (company_name, contact_person, email, phone, address, city, status)
      VALUES (${clientData.company_name}, ${clientData.contact_person}, ${clientData.email}, 
              ${clientData.phone}, ${clientData.address}, ${clientData.city}, ${clientData.status || 'active'})
      RETURNING *
    `;
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update client
exports.updateClient = handleRequest(async (req, res) => {
  const { id } = req.query;
  const updates = req.body;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'Client ID required' });
  }
  
  try {
    const result = await sql`
      UPDATE clients 
      SET company_name = ${updates.company_name},
          contact_person = ${updates.contact_person},
          email = ${updates.email},
          phone = ${updates.phone},
          address = ${updates.address},
          city = ${updates.city},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete client
exports.deleteClient = handleRequest(async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'Client ID required' });
  }
  
  try {
    await sql`DELETE FROM clients WHERE id = ${id}`;
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all projects
exports.getProjects = handleRequest(async (req, res) => {
  try {
    const projects = await sql`
      SELECT p.*, c.company_name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `;
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get project by ID
exports.getProject = handleRequest(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }
  
  try {
    const project = await sql`
      SELECT p.*, c.company_name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = ${id}
    `;
    res.json({ success: true, data: project[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create project
exports.createProject = handleRequest(async (req, res) => {
  const projectData = req.body;
  
  try {
    const result = await sql`
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
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all staff
exports.getStaff = handleRequest(async (req, res) => {
  try {
    const staff = await sql`SELECT * FROM staff ORDER BY created_at DESC`;
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get staff by ID
exports.getStaffMember = handleRequest(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Staff ID required' });
  }
  
  try {
    const staff = await sql`SELECT * FROM staff WHERE id = ${id}`;
    res.json({ success: true, data: staff[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create staff member
exports.createStaff = handleRequest(async (req, res) => {
  const staffData = req.body;
  
  try {
    const result = await sql`
      INSERT INTO staff (
        employee_id, first_name, last_name, email, phone, 
        position, department, status
      )
      VALUES (
        ${staffData.employee_id}, ${staffData.first_name}, ${staffData.last_name},
        ${staffData.email}, ${staffData.phone}, ${staffData.position},
        ${staffData.department}, ${staffData.status || 'active'}
      )
      RETURNING *
    `;
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generic query endpoint (use with caution)
exports.query = handleRequest(async (req, res) => {
  const { table, filters, limit = 100 } = req.body;
  
  if (!table) {
    return res.status(400).json({ success: false, error: 'Table name required' });
  }
  
  // Whitelist allowed tables for security
  const allowedTables = [
    'clients', 'projects', 'staff', 'users', 'contractors', 
    'tasks', 'sow', 'poles', 'drops'
  ];
  
  if (!allowedTables.includes(table)) {
    return res.status(403).json({ success: false, error: 'Table not allowed' });
  }
  
  try {
    let query = `SELECT * FROM ${table}`;
    
    // Add basic filtering
    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      query += ` WHERE ${conditions}`;
    }
    
    query += ` LIMIT ${limit}`;
    
    const result = await sql(query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
exports.health = handleRequest(async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    res.json({ 
      success: true, 
      status: 'healthy',
      database: 'connected',
      time: result[0].current_time 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    });
  }
});