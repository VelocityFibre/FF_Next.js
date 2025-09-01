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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { projectId } = req.body;
  
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }

  try {
    // Create sow_project_summary table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS sow_project_summary (
        id SERIAL PRIMARY KEY,
        project_id UUID UNIQUE NOT NULL,
        project_name VARCHAR(255),
        total_poles INTEGER DEFAULT 0,
        total_drops INTEGER DEFAULT 0,
        total_fibre_segments INTEGER DEFAULT 0,
        total_fibre_length DECIMAL(12, 2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create poles table
    await sql`
      CREATE TABLE IF NOT EXISTS sow_poles (
        id SERIAL PRIMARY KEY,
        project_id UUID NOT NULL,
        pole_number VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        status VARCHAR(100) DEFAULT 'pending',
        pole_type VARCHAR(100),
        pole_spec VARCHAR(255),
        height VARCHAR(50),
        diameter VARCHAR(50),
        owner VARCHAR(100),
        pon_no INTEGER,
        zone_no INTEGER,
        address TEXT,
        municipality VARCHAR(255),
        created_date TIMESTAMP,
        created_by VARCHAR(100),
        comments TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, pole_number)
      )
    `;

    // Create index on project_id for poles
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sow_poles_project_id 
      ON sow_poles(project_id)
    `;

    // Create drops table
    await sql`
      CREATE TABLE IF NOT EXISTS sow_drops (
        id SERIAL PRIMARY KEY,
        project_id UUID NOT NULL,
        drop_number VARCHAR(255) NOT NULL,
        pole_number VARCHAR(255),
        cable_type VARCHAR(100),
        cable_spec VARCHAR(255),
        cable_length VARCHAR(50),
        cable_capacity VARCHAR(50),
        start_point VARCHAR(255),
        end_point VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        pon_no INTEGER,
        zone_no INTEGER,
        municipality VARCHAR(255),
        status VARCHAR(100) DEFAULT 'planned',
        created_date TIMESTAMP,
        created_by VARCHAR(100),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, drop_number)
      )
    `;

    // Create index on project_id and pole_number for drops
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sow_drops_project_id 
      ON sow_drops(project_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sow_drops_pole_number 
      ON sow_drops(project_id, pole_number)
    `;

    // Create fibre table
    await sql`
      CREATE TABLE IF NOT EXISTS sow_fibre (
        id SERIAL PRIMARY KEY,
        project_id UUID NOT NULL,
        segment_id VARCHAR(255) NOT NULL,
        cable_size VARCHAR(50),
        layer VARCHAR(100),
        distance DECIMAL(10, 2),
        pon_no INTEGER,
        zone_no INTEGER,
        string_completed DECIMAL(10, 2),
        date_completed DATE,
        contractor VARCHAR(100),
        status VARCHAR(100) DEFAULT 'planned',
        is_complete BOOLEAN DEFAULT FALSE,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, segment_id)
      )
    `;

    // Create index on project_id for fibre
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sow_fibre_project_id 
      ON sow_fibre(project_id)
    `;

    // Create or update project summary
    await sql`
      INSERT INTO sow_project_summary (project_id, project_name, total_poles, total_drops, total_fibre_segments, total_fibre_length)
      VALUES (${projectId}::uuid, '', 0, 0, 0, 0)
      ON CONFLICT (project_id) DO NOTHING
    `;

    // Check if tables were created successfully
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sow_poles', 'sow_drops', 'sow_fibre', 'sow_project_summary')
    `;

    res.status(200).json({ 
      success: true, 
      message: 'SOW tables initialized successfully',
      tables: tableCheck.map(t => t.table_name),
      projectId: projectId
    });
  } catch (error) {
    console.error('Error initializing SOW tables:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.detail || error.hint || 'Failed to initialize SOW tables'
    });
  }
}