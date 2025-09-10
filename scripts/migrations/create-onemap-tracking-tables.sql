-- OneMap Import Tracking System - Database Schema
-- Creates tables for comprehensive import tracking, deduplication, and history

-- Main import table (replaces simple onemap_imports)
CREATE TABLE IF NOT EXISTS onemap_imports (
    id SERIAL PRIMARY KEY,
    property_id VARCHAR(50) UNIQUE NOT NULL,
    tracking_key VARCHAR(255) NOT NULL, -- pole:LAW.P.B167, drop:DR1234, address:123 Main St, property:12345
    current_data JSONB NOT NULL,
    import_batch_id VARCHAR(100) NOT NULL,
    first_seen_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Import batch tracking
CREATE TABLE IF NOT EXISTS onemap_import_batches (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    total_rows_processed INTEGER DEFAULT 0,
    new_records_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    verification_passed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change history tracking (for status changes and updates)
CREATE TABLE IF NOT EXISTS onemap_change_history (
    id SERIAL PRIMARY KEY,
    property_id VARCHAR(50) NOT NULL,
    batch_id VARCHAR(100) NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- 'new', 'status_change', 'update', 'delete'
    change_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    record_snapshot JSONB, -- Full record data at time of change
    previous_data JSONB, -- Previous state (for updates)
    is_first_instance BOOLEAN DEFAULT false, -- For milestone tracking
    change_reason TEXT, -- Optional reason for change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Import reports storage
CREATE TABLE IF NOT EXISTS onemap_import_reports (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(100) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    report_data JSONB NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- First instance tracking (for avoiding duplicates)
CREATE TABLE IF NOT EXISTS onemap_first_instances (
    id SERIAL PRIMARY KEY,
    pole_number VARCHAR(100),
    status_type VARCHAR(100) NOT NULL, -- 'pole_permission', 'pole_planted', 'home_signup', 'home_install'
    normalized_status VARCHAR(255) NOT NULL,
    first_date TIMESTAMP WITH TIME ZONE NOT NULL,
    property_id VARCHAR(50) NOT NULL,
    original_status TEXT,
    batch_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one first instance per pole + status combination
    UNIQUE(pole_number, status_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onemap_imports_property_id ON onemap_imports(property_id);
CREATE INDEX IF NOT EXISTS idx_onemap_imports_tracking_key ON onemap_imports(tracking_key);
CREATE INDEX IF NOT EXISTS idx_onemap_imports_batch_id ON onemap_imports(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_onemap_imports_active ON onemap_imports(is_active);

CREATE INDEX IF NOT EXISTS idx_onemap_batches_batch_id ON onemap_import_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_onemap_batches_status ON onemap_import_batches(status);
CREATE INDEX IF NOT EXISTS idx_onemap_batches_date ON onemap_import_batches(import_date);

CREATE INDEX IF NOT EXISTS idx_onemap_history_property_id ON onemap_change_history(property_id);
CREATE INDEX IF NOT EXISTS idx_onemap_history_batch_id ON onemap_change_history(batch_id);
CREATE INDEX IF NOT EXISTS idx_onemap_history_change_type ON onemap_change_history(change_type);
CREATE INDEX IF NOT EXISTS idx_onemap_history_date ON onemap_change_history(change_date);
CREATE INDEX IF NOT EXISTS idx_onemap_history_first_instance ON onemap_change_history(is_first_instance);

CREATE INDEX IF NOT EXISTS idx_onemap_reports_batch_id ON onemap_import_reports(batch_id);

CREATE INDEX IF NOT EXISTS idx_onemap_first_instances_pole ON onemap_first_instances(pole_number);
CREATE INDEX IF NOT EXISTS idx_onemap_first_instances_status ON onemap_first_instances(status_type);
CREATE INDEX IF NOT EXISTS idx_onemap_first_instances_date ON onemap_first_instances(first_date);

-- JSONB indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_onemap_imports_current_data_gin ON onemap_imports USING GIN (current_data);
CREATE INDEX IF NOT EXISTS idx_onemap_history_snapshot_gin ON onemap_change_history USING GIN (record_snapshot);
CREATE INDEX IF NOT EXISTS idx_onemap_history_previous_gin ON onemap_change_history USING GIN (previous_data);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_onemap_imports_updated_at
    BEFORE UPDATE ON onemap_imports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onemap_import_batches_updated_at
    BEFORE UPDATE ON onemap_import_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for easy querying

-- Current active records view
CREATE OR REPLACE VIEW onemap_current_records AS
SELECT
    property_id,
    tracking_key,
    current_data,
    import_batch_id,
    first_seen_date,
    last_updated_date,
    version
FROM onemap_imports
WHERE is_active = true;

-- Recent changes view
CREATE OR REPLACE VIEW onemap_recent_changes AS
SELECT
    h.property_id,
    h.change_type,
    h.change_date,
    h.is_first_instance,
    h.record_snapshot,
    b.file_name,
    b.import_date
FROM onemap_change_history h
JOIN onemap_import_batches b ON h.batch_id = b.batch_id
ORDER BY h.change_date DESC
LIMIT 1000;

-- First instances summary view
CREATE OR REPLACE VIEW onemap_first_instances_summary AS
SELECT
    status_type,
    COUNT(*) as count,
    MIN(first_date) as earliest_date,
    MAX(first_date) as latest_date
FROM onemap_first_instances
GROUP BY status_type
ORDER BY status_type;

-- Grant permissions (adjust as needed for your application)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;