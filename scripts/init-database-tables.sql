-- Initialize all required tables for FibreFlow
-- This script ensures all tables exist with proper structure

-- Create clients table if not exists
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'USA',
  postal_code VARCHAR(20),
  website VARCHAR(255),
  industry VARCHAR(100),
  client_type VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'active',
  contract_value DECIMAL(15,2),
  payment_terms VARCHAR(100),
  tax_id VARCHAR(50),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(client_type);

-- Create projects table if not exists
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  project_name VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  description TEXT,
  project_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'planning',
  priority VARCHAR(20) DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  project_manager UUID,
  team_lead UUID,
  location TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  progress_percentage INTEGER DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  deliverables JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(project_code);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager);

-- Create SOW Poles table with proper structure
CREATE TABLE IF NOT EXISTS sow_poles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  pole_number VARCHAR(255) NOT NULL,
  location VARCHAR(500),
  pole_type VARCHAR(100),
  height DECIMAL(10,2),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status VARCHAR(50) DEFAULT 'pending',
  installation_date DATE,
  installed_by VARCHAR(255),
  inspection_status VARCHAR(50),
  inspection_date DATE,
  notes TEXT,
  photos JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sow_poles
CREATE INDEX IF NOT EXISTS idx_sow_poles_project ON sow_poles(project_id);
CREATE INDEX IF NOT EXISTS idx_sow_poles_number ON sow_poles(pole_number);
CREATE INDEX IF NOT EXISTS idx_sow_poles_status ON sow_poles(status);

-- Create SOW Drops table with proper structure
CREATE TABLE IF NOT EXISTS sow_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  drop_number VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  drop_type VARCHAR(100),
  cable_length DECIMAL(10,2),
  cable_type VARCHAR(100),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status VARCHAR(50) DEFAULT 'pending',
  installation_date DATE,
  installed_by VARCHAR(255),
  tested BOOLEAN DEFAULT FALSE,
  test_date DATE,
  test_results JSONB DEFAULT '{}',
  notes TEXT,
  photos JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sow_drops
CREATE INDEX IF NOT EXISTS idx_sow_drops_project ON sow_drops(project_id);
CREATE INDEX IF NOT EXISTS idx_sow_drops_number ON sow_drops(drop_number);
CREATE INDEX IF NOT EXISTS idx_sow_drops_status ON sow_drops(status);

-- Create SOW Fibre table with proper structure
CREATE TABLE IF NOT EXISTS sow_fibre (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  cable_id VARCHAR(255) NOT NULL,
  cable_type VARCHAR(100),
  cable_size VARCHAR(50),
  fiber_count INTEGER,
  start_location VARCHAR(255),
  end_location VARCHAR(255),
  start_latitude DECIMAL(10,8),
  start_longitude DECIMAL(11,8),
  end_latitude DECIMAL(10,8),
  end_longitude DECIMAL(11,8),
  length DECIMAL(10,2),
  installation_method VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  installation_date DATE,
  installed_by VARCHAR(255),
  splicing_complete BOOLEAN DEFAULT FALSE,
  splicing_date DATE,
  testing_complete BOOLEAN DEFAULT FALSE,
  test_date DATE,
  test_results JSONB DEFAULT '{}',
  notes TEXT,
  route_map JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sow_fibre
CREATE INDEX IF NOT EXISTS idx_sow_fibre_project ON sow_fibre(project_id);
CREATE INDEX IF NOT EXISTS idx_sow_fibre_cable_id ON sow_fibre(cable_id);
CREATE INDEX IF NOT EXISTS idx_sow_fibre_status ON sow_fibre(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sow_poles_updated_at ON sow_poles;
CREATE TRIGGER update_sow_poles_updated_at BEFORE UPDATE ON sow_poles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sow_drops_updated_at ON sow_drops;
CREATE TRIGGER update_sow_drops_updated_at BEFORE UPDATE ON sow_drops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sow_fibre_updated_at ON sow_fibre;
CREATE TRIGGER update_sow_fibre_updated_at BEFORE UPDATE ON sow_fibre
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add sample data (optional - comment out if not needed)
-- This will only insert if tables are empty

-- Insert sample client if none exist
INSERT INTO clients (company_name, contact_person, email, phone, city, state, status)
SELECT 'Sample Telecom Corp', 'John Doe', 'john@telecom.com', '555-0100', 'San Francisco', 'CA', 'active'
WHERE NOT EXISTS (SELECT 1 FROM clients LIMIT 1);

-- Insert sample project if none exist
INSERT INTO projects (project_code, project_name, description, status, priority, budget)
SELECT 'PRJ-2025-001', 'Downtown Fiber Network Expansion', 'Expanding fiber network coverage in downtown area', 'active', 'high', 250000
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);