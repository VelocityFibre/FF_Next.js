-- Initial schema migration
-- This is an example migration file showing the structure

-- Create example tables if they don't exist
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Example of adding a column (safe with IF NOT EXISTS pattern)
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;