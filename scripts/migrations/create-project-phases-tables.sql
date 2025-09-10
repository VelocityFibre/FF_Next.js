-- Project Phases Migration
-- Creates tables for managing project phases, tasks, and steps
-- Migration Date: 2025-09-10

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS phase_step_checklist CASCADE;
DROP TABLE IF EXISTS phase_task_comments CASCADE;
DROP TABLE IF EXISTS phase_task_checklist CASCADE;
DROP TABLE IF EXISTS phase_tasks CASCADE;
DROP TABLE IF EXISTS phase_steps CASCADE;
DROP TABLE IF EXISTS project_phases CASCADE;

-- Create project_phases table
CREATE TABLE IF NOT EXISTS project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase_type VARCHAR(50),
    phase_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    dependencies JSONB DEFAULT '[]'::jsonb,
    milestones JSONB DEFAULT '[]'::jsonb,
    assigned_to JSONB DEFAULT '[]'::jsonb,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_phases_project FOREIGN KEY (project_id) 
        REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT valid_phase_type CHECK (phase_type IN (
        'planning', 'design', 'procurement', 'construction', 
        'testing', 'commissioning', 'handover', 'maintenance'
    )),
    CONSTRAINT valid_phase_status CHECK (status IN (
        'not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'
    ))
);

-- Create phase_steps table
CREATE TABLE IF NOT EXISTS phase_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    planned_duration INTEGER, -- in hours
    actual_duration INTEGER,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    assigned_to JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    resources JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phase_steps_phase FOREIGN KEY (phase_id) 
        REFERENCES project_phases(id) ON DELETE CASCADE,
    CONSTRAINT valid_step_status CHECK (status IN (
        'not_started', 'in_progress', 'completed', 'blocked', 'skipped', 'on_hold'
    ))
);

-- Create phase_tasks table
CREATE TABLE IF NOT EXISTS phase_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL,
    phase_id UUID NOT NULL, -- Denormalized for easier querying
    project_id UUID NOT NULL, -- Denormalized for easier querying
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    start_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    assigned_to VARCHAR(255),
    assigned_to_name VARCHAR(255),
    attachments JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,
    dependencies JSONB DEFAULT '[]'::jsonb,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phase_tasks_step FOREIGN KEY (step_id) 
        REFERENCES phase_steps(id) ON DELETE CASCADE,
    CONSTRAINT fk_phase_tasks_phase FOREIGN KEY (phase_id) 
        REFERENCES project_phases(id) ON DELETE CASCADE,
    CONSTRAINT fk_phase_tasks_project FOREIGN KEY (project_id) 
        REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT valid_task_status CHECK (status IN (
        'not_started', 'in_progress', 'completed', 'blocked', 'cancelled', 'deferred'
    )),
    CONSTRAINT valid_task_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create phase_task_checklist table
CREATE TABLE IF NOT EXISTS phase_task_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_by VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_checklist_task FOREIGN KEY (task_id) 
        REFERENCES phase_tasks(id) ON DELETE CASCADE
);

-- Create phase_step_checklist table
CREATE TABLE IF NOT EXISTS phase_step_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_by VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_step_checklist_step FOREIGN KEY (step_id) 
        REFERENCES phase_steps(id) ON DELETE CASCADE
);

-- Create phase_task_comments table
CREATE TABLE IF NOT EXISTS phase_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    text TEXT NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) 
        REFERENCES phase_tasks(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX idx_project_phases_status ON project_phases(status);
CREATE INDEX idx_project_phases_order ON project_phases(phase_order);

CREATE INDEX idx_phase_steps_phase_id ON phase_steps(phase_id);
CREATE INDEX idx_phase_steps_status ON phase_steps(status);
CREATE INDEX idx_phase_steps_order ON phase_steps(step_order);

CREATE INDEX idx_phase_tasks_step_id ON phase_tasks(step_id);
CREATE INDEX idx_phase_tasks_phase_id ON phase_tasks(phase_id);
CREATE INDEX idx_phase_tasks_project_id ON phase_tasks(project_id);
CREATE INDEX idx_phase_tasks_status ON phase_tasks(status);
CREATE INDEX idx_phase_tasks_assigned_to ON phase_tasks(assigned_to);
CREATE INDEX idx_phase_tasks_priority ON phase_tasks(priority);
CREATE INDEX idx_phase_tasks_order ON phase_tasks(task_order);

CREATE INDEX idx_task_checklist_task_id ON phase_task_checklist(task_id);
CREATE INDEX idx_step_checklist_step_id ON phase_step_checklist(step_id);
CREATE INDEX idx_task_comments_task_id ON phase_task_comments(task_id);

-- Create a view for phase hierarchy with computed progress
CREATE OR REPLACE VIEW phase_hierarchy_view AS
SELECT 
    p.id,
    p.project_id,
    p.name,
    p.description,
    p.phase_type,
    p.phase_order,
    p.status,
    p.progress,
    p.planned_start_date,
    p.planned_end_date,
    p.actual_start_date,
    p.actual_end_date,
    p.budget,
    p.actual_cost,
    COUNT(DISTINCT s.id) as total_steps,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_steps,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    p.created_at,
    p.updated_at
FROM project_phases p
LEFT JOIN phase_steps s ON s.phase_id = p.id
LEFT JOIN phase_tasks t ON t.phase_id = p.id
GROUP BY p.id;

-- Create function to calculate and update phase progress
CREATE OR REPLACE FUNCTION update_phase_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update step progress when task changes
    IF TG_TABLE_NAME = 'phase_tasks' THEN
        UPDATE phase_steps
        SET progress = (
            SELECT COALESCE(AVG(progress), 0)
            FROM phase_tasks
            WHERE step_id = COALESCE(NEW.step_id, OLD.step_id)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = COALESCE(NEW.step_id, OLD.step_id);
        
        -- Also update phase progress
        UPDATE project_phases
        SET progress = (
            SELECT COALESCE(AVG(s.progress), 0)
            FROM phase_steps s
            WHERE s.phase_id = COALESCE(NEW.phase_id, OLD.phase_id)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = COALESCE(NEW.phase_id, OLD.phase_id);
    END IF;
    
    -- Update phase progress when step changes
    IF TG_TABLE_NAME = 'phase_steps' THEN
        UPDATE project_phases
        SET progress = (
            SELECT COALESCE(AVG(progress), 0)
            FROM phase_steps
            WHERE phase_id = COALESCE(NEW.phase_id, OLD.phase_id)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = COALESCE(NEW.phase_id, OLD.phase_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update progress
CREATE TRIGGER update_phase_progress_on_task_change
    AFTER INSERT OR UPDATE OR DELETE ON phase_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_phase_progress();

CREATE TRIGGER update_phase_progress_on_step_change
    AFTER INSERT OR UPDATE OR DELETE ON phase_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_phase_progress();

-- Create function to update project overall progress
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects
    SET progress = (
        SELECT COALESCE(AVG(progress), 0)
        FROM project_phases
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update project progress when phase changes
CREATE TRIGGER update_project_progress_on_phase_change
    AFTER INSERT OR UPDATE OR DELETE ON project_phases
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- Add progress column to projects table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'progress') THEN
        ALTER TABLE projects ADD COLUMN progress DECIMAL(5,2) DEFAULT 0 
            CHECK (progress >= 0 AND progress <= 100);
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Project phases tables created successfully!';
    RAISE NOTICE 'Tables created: project_phases, phase_steps, phase_tasks, phase_task_checklist, phase_step_checklist, phase_task_comments';
    RAISE NOTICE 'Indexes and triggers configured for automatic progress tracking';
END $$;