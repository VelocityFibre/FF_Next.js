-- FibreFlow Demo Database Setup
-- Creates essential tables and populates with demo data

-- Clean existing data (if any)
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS sow_imports CASCADE;

-- Create Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id),
    description TEXT,
    project_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planning',
    priority VARCHAR(20) DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    progress INTEGER DEFAULT 0,
    project_manager VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Staff table
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create SOW Imports table
CREATE TABLE IF NOT EXISTS sow_imports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    file_name VARCHAR(255),
    import_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    total_records INTEGER,
    processed_records INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    imported_by VARCHAR(255),
    imported_at TIMESTAMP DEFAULT NOW()
);

-- Insert Demo Clients
INSERT INTO clients (client_code, client_name, contact_person, email, phone, city, country, status) VALUES
('CL001', 'TechCorp Solutions', 'John Smith', 'john@techcorp.com', '+1-555-0100', 'San Francisco', 'USA', 'active'),
('CL002', 'Global Networks Inc', 'Sarah Johnson', 'sarah@globalnet.com', '+1-555-0200', 'New York', 'USA', 'active'),
('CL003', 'FiberConnect Ltd', 'Michael Brown', 'michael@fiberconnect.com', '+44-20-7946-0958', 'London', 'UK', 'active'),
('CL004', 'Metro Broadband', 'Emily Davis', 'emily@metrobroadband.com', '+1-555-0400', 'Los Angeles', 'USA', 'active'),
('CL005', 'Rural Internet Co', 'David Wilson', 'david@ruralnet.com', '+1-555-0500', 'Denver', 'USA', 'active');

-- Insert Demo Projects
INSERT INTO projects (project_code, project_name, client_id, description, project_type, status, priority, start_date, end_date, budget, progress, project_manager, location) VALUES
('PRJ001', 'Downtown Fiber Expansion', 
    (SELECT id FROM clients WHERE client_code = 'CL001'),
    'Expanding fiber network coverage in downtown business district', 
    'Network Expansion', 'in_progress', 'high', 
    '2024-01-15', '2024-06-30', 2500000.00, 65, 
    'Robert Chen', 'San Francisco, CA'),
    
('PRJ002', 'Campus Network Upgrade', 
    (SELECT id FROM clients WHERE client_code = 'CL002'),
    'Complete network infrastructure upgrade for university campus', 
    'Infrastructure Upgrade', 'planning', 'medium', 
    '2024-03-01', '2024-09-30', 1800000.00, 15, 
    'Lisa Anderson', 'New York, NY'),
    
('PRJ003', 'Residential Fiber Rollout', 
    (SELECT id FROM clients WHERE client_code = 'CL003'),
    'New fiber installation for residential neighborhoods', 
    'New Installation', 'in_progress', 'high', 
    '2024-02-01', '2024-12-31', 5000000.00, 40, 
    'James Taylor', 'London, UK'),
    
('PRJ004', 'Data Center Connection', 
    (SELECT id FROM clients WHERE client_code = 'CL004'),
    'High-speed fiber connections between data centers', 
    'Network Expansion', 'completed', 'critical', 
    '2023-10-01', '2024-01-31', 3200000.00, 100, 
    'Maria Garcia', 'Los Angeles, CA'),
    
('PRJ005', 'Rural Broadband Initiative', 
    (SELECT id FROM clients WHERE client_code = 'CL005'),
    'Bringing high-speed internet to rural communities', 
    'New Installation', 'in_progress', 'medium', 
    '2024-01-01', '2025-06-30', 8000000.00, 25, 
    'Thomas Johnson', 'Colorado');

-- Insert Demo Staff
INSERT INTO staff (employee_id, first_name, last_name, email, department, position, hire_date, status) VALUES
('EMP001', 'Robert', 'Chen', 'robert.chen@fibreflow.com', 'Engineering', 'Project Manager', '2020-03-15', 'active'),
('EMP002', 'Lisa', 'Anderson', 'lisa.anderson@fibreflow.com', 'Engineering', 'Senior Engineer', '2019-06-01', 'active'),
('EMP003', 'James', 'Taylor', 'james.taylor@fibreflow.com', 'Operations', 'Operations Manager', '2018-01-10', 'active'),
('EMP004', 'Maria', 'Garcia', 'maria.garcia@fibreflow.com', 'Engineering', 'Lead Engineer', '2021-02-20', 'active'),
('EMP005', 'Thomas', 'Johnson', 'thomas.johnson@fibreflow.com', 'Field Operations', 'Field Supervisor', '2020-09-15', 'active'),
('EMP006', 'Emma', 'Williams', 'emma.williams@fibreflow.com', 'Quality Assurance', 'QA Manager', '2019-11-01', 'active'),
('EMP007', 'Daniel', 'Martinez', 'daniel.martinez@fibreflow.com', 'Field Operations', 'Field Technician', '2022-03-10', 'active'),
('EMP008', 'Sophie', 'Brown', 'sophie.brown@fibreflow.com', 'Administration', 'Admin Manager', '2018-05-15', 'active'),
('EMP009', 'Alex', 'Davis', 'alex.davis@fibreflow.com', 'Engineering', 'Network Engineer', '2023-01-05', 'active'),
('EMP010', 'Rachel', 'Wilson', 'rachel.wilson@fibreflow.com', 'Finance', 'Finance Manager', '2020-07-01', 'active');

-- Insert Demo SOW Imports
INSERT INTO sow_imports (project_id, file_name, import_type, status, total_records, processed_records, error_count, imported_by) VALUES
((SELECT id FROM projects WHERE project_code = 'PRJ001'), 'downtown_poles.xlsx', 'poles', 'completed', 250, 250, 0, 'robert.chen@fibreflow.com'),
((SELECT id FROM projects WHERE project_code = 'PRJ001'), 'downtown_drops.csv', 'drops', 'completed', 180, 180, 0, 'robert.chen@fibreflow.com'),
((SELECT id FROM projects WHERE project_code = 'PRJ003'), 'residential_poles.xlsx', 'poles', 'processing', 500, 325, 5, 'james.taylor@fibreflow.com'),
((SELECT id FROM projects WHERE project_code = 'PRJ003'), 'residential_fiber.csv', 'fiber', 'pending', 1000, 0, 0, 'james.taylor@fibreflow.com'),
((SELECT id FROM projects WHERE project_code = 'PRJ005'), 'rural_infrastructure.xlsx', 'poles', 'completed', 800, 800, 2, 'thomas.johnson@fibreflow.com');

-- Create indexes for better performance
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_sow_imports_project_id ON sow_imports(project_id);

-- Success message
SELECT 'Demo database setup completed successfully!' as message;