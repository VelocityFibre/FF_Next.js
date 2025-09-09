-- OneMap Data Import Tables
-- For storing geographic data from 1Map application Excel exports

-- Import history table
CREATE TABLE IF NOT EXISTS onemap_imports (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    records_imported INTEGER DEFAULT 0,
    imported_by VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Main properties table from 1Map
CREATE TABLE IF NOT EXISTS onemap_properties (
    id SERIAL PRIMARY KEY,
    import_id INTEGER REFERENCES onemap_imports(id) ON DELETE CASCADE,
    property_id VARCHAR(100),
    onemap_nad_id VARCHAR(100),
    job_id VARCHAR(100),
    status VARCHAR(255),
    flow_name_groups VARCHAR(255),
    site VARCHAR(50),
    sections VARCHAR(50),
    pons VARCHAR(50),
    location_address TEXT,
    latitude DECIMAL(12, 10),
    longitude DECIMAL(13, 10),
    stand_number VARCHAR(100),
    pole_number VARCHAR(100),
    drop_number VARCHAR(100),
    -- Contact information
    contact_name VARCHAR(255),
    contact_surname VARCHAR(255),
    contact_number VARCHAR(50),
    email_address VARCHAR(255),
    id_number VARCHAR(50),
    -- Pole permission fields
    pole_permission_status VARCHAR(100),
    owner_or_tenant VARCHAR(50),
    pole_permission_date DATE,
    pole_permission_agent VARCHAR(255),
    pole_lat DECIMAL(12, 10),
    pole_lng DECIMAL(13, 10),
    -- Home sign up fields
    home_signup_date TIMESTAMP,
    home_signup_agent VARCHAR(255),
    -- Installation fields
    ont_barcode VARCHAR(255),
    ont_activation_code VARCHAR(255),
    dome_joint_number VARCHAR(100),
    drop_cable_length DECIMAL(10, 2),
    installer_name VARCHAR(255),
    installation_date TIMESTAMP,
    -- Sales fields
    sales_agent VARCHAR(255),
    sales_date TIMESTAMP,
    -- Metadata
    last_modified_by VARCHAR(255),
    last_modified_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(import_id, property_id)
);

-- Simplified poles table (extracted from properties)
CREATE TABLE IF NOT EXISTS onemap_poles (
    id SERIAL PRIMARY KEY,
    import_id INTEGER REFERENCES onemap_imports(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES onemap_properties(id) ON DELETE CASCADE,
    pole_number VARCHAR(100) UNIQUE,
    latitude DECIMAL(12, 10),
    longitude DECIMAL(13, 10),
    status VARCHAR(100),
    permission_date DATE,
    agent_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Simplified drops table (extracted from properties)
CREATE TABLE IF NOT EXISTS onemap_drops (
    id SERIAL PRIMARY KEY,
    import_id INTEGER REFERENCES onemap_imports(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES onemap_properties(id) ON DELETE CASCADE,
    drop_number VARCHAR(100) UNIQUE,
    latitude DECIMAL(12, 10),
    longitude DECIMAL(13, 10),
    address TEXT,
    customer_name VARCHAR(255),
    contact_number VARCHAR(50),
    status VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Installations table
CREATE TABLE IF NOT EXISTS onemap_installations (
    id SERIAL PRIMARY KEY,
    import_id INTEGER REFERENCES onemap_imports(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES onemap_properties(id) ON DELETE CASCADE,
    ont_barcode VARCHAR(255),
    ont_activation_code VARCHAR(255),
    dome_joint_number VARCHAR(100),
    drop_cable_length DECIMAL(10, 2),
    installer_name VARCHAR(255),
    installation_date TIMESTAMP,
    latitude DECIMAL(12, 10),
    longitude DECIMAL(13, 10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_onemap_properties_location ON onemap_properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_onemap_properties_import ON onemap_properties(import_id);
CREATE INDEX IF NOT EXISTS idx_onemap_properties_property_id ON onemap_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_onemap_poles_location ON onemap_poles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_onemap_poles_import ON onemap_poles(import_id);
CREATE INDEX IF NOT EXISTS idx_onemap_poles_number ON onemap_poles(pole_number);
CREATE INDEX IF NOT EXISTS idx_onemap_drops_location ON onemap_drops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_onemap_drops_import ON onemap_drops(import_id);
CREATE INDEX IF NOT EXISTS idx_onemap_drops_number ON onemap_drops(drop_number);
CREATE INDEX IF NOT EXISTS idx_onemap_installations_import ON onemap_installations(import_id);
CREATE INDEX IF NOT EXISTS idx_onemap_installations_property ON onemap_installations(property_id);
CREATE INDEX IF NOT EXISTS idx_onemap_imports_status ON onemap_imports(status);