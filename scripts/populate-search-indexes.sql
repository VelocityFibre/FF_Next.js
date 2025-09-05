-- FibreFlow Search Indexes & Metadata Population Script
-- This script creates comprehensive search infrastructure for fast, efficient searching

-- =====================================================
-- 1. CREATE SEARCH METADATA TABLES
-- =====================================================

-- Search synonyms table for query expansion
CREATE TABLE IF NOT EXISTS search_synonyms (
    id SERIAL PRIMARY KEY,
    term VARCHAR(100) NOT NULL,
    synonym VARCHAR(100) NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(term, synonym)
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    search_query TEXT NOT NULL,
    search_type VARCHAR(50), -- 'global', 'projects', 'staff', 'contractors', 'equipment'
    filters_applied JSONB,
    result_count INTEGER,
    clicked_results JSONB,
    search_duration_ms INTEGER,
    session_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_search_history_user (user_id),
    INDEX idx_search_history_created (created_at),
    INDEX idx_search_history_query (search_query)
);

-- Popular searches cache
CREATE TABLE IF NOT EXISTS popular_searches (
    id SERIAL PRIMARY KEY,
    search_term VARCHAR(255) NOT NULL,
    search_count INTEGER DEFAULT 1,
    last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(50),
    UNIQUE(search_term, category)
);

-- Saved filters per user
CREATE TABLE IF NOT EXISTS saved_filters (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    filter_name VARCHAR(100) NOT NULL,
    filter_type VARCHAR(50), -- 'projects', 'staff', 'equipment', etc.
    filter_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, filter_name, filter_type)
);

-- Quick filter presets (system-wide)
CREATE TABLE IF NOT EXISTS filter_presets (
    id SERIAL PRIMARY KEY,
    preset_name VARCHAR(100) NOT NULL,
    preset_type VARCHAR(50) NOT NULL,
    filter_config JSONB NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(preset_name, preset_type)
);

-- Auto-complete suggestions
CREATE TABLE IF NOT EXISTS autocomplete_suggestions (
    id SERIAL PRIMARY KEY,
    suggestion_type VARCHAR(50) NOT NULL, -- 'project_name', 'staff_skill', 'location', 'equipment'
    suggestion_text VARCHAR(255) NOT NULL,
    parent_text VARCHAR(255),
    usage_count INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(suggestion_type, suggestion_text)
);

-- Search performance metrics
CREATE TABLE IF NOT EXISTS search_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    search_type VARCHAR(50),
    total_searches INTEGER DEFAULT 0,
    avg_duration_ms DECIMAL(10,2),
    failed_searches INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    top_queries JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, search_type)
);

-- =====================================================
-- 2. ADD FULL-TEXT SEARCH COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add tsvector columns for full-text search if they don't exist
DO $$ 
BEGIN
    -- Projects table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'search_vector') THEN
        ALTER TABLE projects ADD COLUMN search_vector tsvector;
    END IF;
    
    -- Staff table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'staff' AND column_name = 'search_vector') THEN
        ALTER TABLE staff ADD COLUMN search_vector tsvector;
    END IF;
    
    -- Contractors table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contractors' AND column_name = 'search_vector') THEN
        ALTER TABLE contractors ADD COLUMN search_vector tsvector;
    END IF;
    
    -- Clients table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'search_vector') THEN
        ALTER TABLE clients ADD COLUMN search_vector tsvector;
    END IF;
    
    -- Equipment table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'equipment' AND column_name = 'search_vector') THEN
        ALTER TABLE equipment ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- =====================================================
-- 3. UPDATE SEARCH VECTORS WITH WEIGHTED CONTENT
-- =====================================================

-- Update projects search vector
UPDATE projects SET search_vector = 
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(client_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(location, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(project_type, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(status, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'D');

-- Update staff search vector
UPDATE staff SET search_vector = 
    setweight(to_tsvector('english', COALESCE(first_name || ' ' || last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(role, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(department, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(skills, '')), 'C');

-- Update contractors search vector (if exists)
UPDATE contractors SET search_vector = 
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(company_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(specialization, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(email, '')), 'C');

-- Update clients search vector
UPDATE clients SET search_vector = 
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(company_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(industry, '')), 'C');

-- Update equipment search vector (if exists)
UPDATE equipment SET search_vector = 
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(model, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(manufacturer, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(status, '')), 'D');

-- =====================================================
-- 4. CREATE INDEXES FOR FULL-TEXT SEARCH
-- =====================================================

-- Create GIN indexes for tsvector columns
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_staff_search ON staff USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_contractors_search ON contractors USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_clients_search ON clients USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_equipment_search ON equipment USING GIN(search_vector);

-- Create additional indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_projects_name_gin ON projects USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_name);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_staff_name_gin ON staff USING GIN(to_tsvector('english', first_name || ' ' || last_name));
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

-- =====================================================
-- 5. POPULATE SEARCH SYNONYMS
-- =====================================================

INSERT INTO search_synonyms (term, synonym, weight) VALUES
-- Project terms
('project', 'job', 0.9),
('project', 'work', 0.8),
('project', 'task', 0.7),
('fiber', 'fibre', 1.0),
('cable', 'wire', 0.9),
('install', 'installation', 1.0),
('deploy', 'deployment', 1.0),
('pole', 'post', 0.9),
('drop', 'connection', 0.8),
('splice', 'joint', 0.9),
('test', 'testing', 1.0),
('commission', 'commissioning', 1.0),
-- Status terms
('active', 'ongoing', 1.0),
('active', 'in progress', 0.9),
('complete', 'completed', 1.0),
('complete', 'finished', 0.9),
('complete', 'done', 0.8),
('pending', 'waiting', 0.9),
('pending', 'on hold', 0.8),
-- Staff terms
('engineer', 'technician', 0.8),
('manager', 'supervisor', 0.9),
('lead', 'senior', 0.9),
('contractor', 'subcontractor', 0.9),
('team', 'crew', 0.9),
-- Location terms
('site', 'location', 1.0),
('area', 'region', 0.9),
('zone', 'sector', 0.9),
-- Equipment terms
('tool', 'equipment', 0.9),
('vehicle', 'truck', 0.8),
('splicer', 'fusion splicer', 1.0),
('otdr', 'optical time domain reflectometer', 1.0),
('meter', 'power meter', 0.9)
ON CONFLICT (term, synonym) DO UPDATE SET weight = EXCLUDED.weight;

-- =====================================================
-- 6. POPULATE SEARCH HISTORY WITH REALISTIC DATA
-- =====================================================

-- Generate 500+ realistic search queries
INSERT INTO search_history (user_id, search_query, search_type, filters_applied, result_count, search_duration_ms, created_at)
SELECT 
    'user_' || (random() * 50)::int,
    query,
    search_type,
    filters,
    (random() * 100)::int,
    (random() * 500 + 50)::int,
    CURRENT_TIMESTAMP - (random() * 90 || ' days')::interval
FROM (
    SELECT 
        unnest(ARRAY[
            'fiber installation downtown', 'pole inspection route 5', 'drop connections phase 2',
            'splice enclosure inventory', 'technician availability this week', 'project status update',
            'cable pulling team alpha', 'testing equipment checkout', 'safety compliance report',
            'contractor performance metrics', 'budget variance analysis', 'milestone completion rate',
            'John Smith', 'active projects', 'pending approvals', 'equipment maintenance schedule',
            'quality assurance checklist', 'permit status municipal', 'route planning optimization',
            'workforce allocation dashboard', 'material requisition forms', 'invoice processing queue',
            'training certification expiry', 'emergency response protocol', 'weather delay impact',
            'customer installation requests', 'network expansion phase 3', 'backbone infrastructure',
            'last mile connectivity', 'rural deployment initiative', 'urban density analysis',
            'fiber optic cable specs', 'trenching requirements depth', 'aerial installation guidelines',
            'underground conduit mapping', 'right of way permits', 'environmental impact assessment',
            'project timeline gantt', 'resource utilization report', 'cost benefit analysis',
            'risk mitigation strategies', 'stakeholder communication plan', 'change order management',
            'quality control metrics', 'performance indicators KPI', 'service level agreement',
            'maintenance window schedule', 'outage notification system', 'restoration priority list',
            'inventory management system', 'spare parts availability', 'vendor contact directory',
            'procurement approval workflow', 'purchase order tracking', 'delivery status update',
            'invoice reconciliation process', 'budget allocation review', 'expense report submission',
            'timesheet approval pending', 'overtime authorization request', 'leave balance inquiry',
            'skills matrix update', 'certification renewal reminder', 'safety training compliance',
            'incident report filing', 'near miss documentation', 'corrective action plan',
            'preventive maintenance schedule', 'equipment calibration due', 'tool inventory audit',
            'vehicle fleet management', 'fuel consumption tracking', 'GPS location services',
            'work order assignment', 'task priority setting', 'completion verification process',
            'customer satisfaction survey', 'service quality metrics', 'complaint resolution tracking',
            'network performance monitoring', 'bandwidth utilization report', 'latency measurement data',
            'fiber characterization results', 'OTDR test reports', 'splice loss measurements',
            'power budget calculations', 'link loss analysis', 'chromatic dispersion testing',
            'polarization mode dispersion', 'return loss measurements', 'insertion loss data'
        ]) as query,
        unnest(ARRAY['global', 'projects', 'staff', 'contractors', 'equipment']) as search_type,
        jsonb_build_object(
            'date_range', CASE WHEN random() > 0.5 THEN 'last_30_days' ELSE 'all_time' END,
            'status', CASE WHEN random() > 0.5 THEN 'active' ELSE NULL END,
            'department', CASE WHEN random() > 0.7 THEN 'Engineering' ELSE NULL END
        ) as filters
    LIMIT 500
) as searches;

-- Add more specific project searches
INSERT INTO search_history (user_id, search_query, search_type, filters_applied, result_count, search_duration_ms, created_at)
SELECT 
    'user_' || (random() * 50)::int,
    'project ' || project_words,
    'projects',
    jsonb_build_object('status', status_filter, 'client', CASE WHEN random() > 0.6 THEN 'Telco Corp' ELSE NULL END),
    (random() * 50)::int,
    (random() * 300 + 100)::int,
    CURRENT_TIMESTAMP - (random() * 60 || ' days')::interval
FROM (
    SELECT 
        unnest(ARRAY['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet']) || ' ' ||
        unnest(ARRAY['deployment', 'installation', 'upgrade', 'maintenance', 'expansion']) as project_words,
        unnest(ARRAY['active', 'completed', 'pending', 'on_hold']) as status_filter
    LIMIT 100
) as project_searches;

-- =====================================================
-- 7. POPULATE POPULAR SEARCHES
-- =====================================================

INSERT INTO popular_searches (search_term, search_count, category, last_searched)
SELECT 
    search_query,
    COUNT(*),
    search_type,
    MAX(created_at)
FROM search_history
GROUP BY search_query, search_type
HAVING COUNT(*) > 1
ON CONFLICT (search_term, category) 
DO UPDATE SET 
    search_count = popular_searches.search_count + EXCLUDED.search_count,
    last_searched = GREATEST(popular_searches.last_searched, EXCLUDED.last_searched);

-- =====================================================
-- 8. POPULATE FILTER PRESETS
-- =====================================================

INSERT INTO filter_presets (preset_name, preset_type, filter_config, description, icon, sort_order) VALUES
-- Project filters
('Active Projects', 'projects', '{"status": ["active", "in_progress"], "date_range": "current"}', 'Show all active and in-progress projects', 'play-circle', 1),
('My Projects', 'projects', '{"assigned_to": "@current_user", "status": ["active"]}', 'Projects assigned to current user', 'user', 2),
('Urgent Projects', 'projects', '{"priority": "high", "status": ["active"], "deadline": "next_7_days"}', 'High priority projects due soon', 'alert-triangle', 3),
('Completed This Month', 'projects', '{"status": ["completed"], "completed_date": "current_month"}', 'Projects completed in current month', 'check-circle', 4),
('Overdue Projects', 'projects', '{"status": ["active"], "end_date": "overdue"}', 'Projects past their deadline', 'clock', 5),
-- Staff filters
('Available Technicians', 'staff', '{"role": ["technician", "field_tech"], "availability": "available"}', 'Technicians available for assignment', 'users', 1),
('Certified Splicers', 'staff', '{"certifications": ["fiber_splicing"], "status": "active"}', 'Staff certified in fiber splicing', 'award', 2),
('Project Managers', 'staff', '{"role": ["project_manager", "pm"], "status": "active"}', 'Active project managers', 'briefcase', 3),
('On Leave', 'staff', '{"availability": "on_leave"}', 'Staff currently on leave', 'calendar-off', 4),
-- Equipment filters
('Available Equipment', 'equipment', '{"status": "available", "condition": ["good", "excellent"]}', 'Equipment ready for use', 'tool', 1),
('Due for Maintenance', 'equipment', '{"maintenance_due": "next_30_days"}', 'Equipment requiring maintenance soon', 'wrench', 2),
('Testing Equipment', 'equipment', '{"category": "testing", "status": ["available", "in_use"]}', 'All testing equipment', 'activity', 3),
('Vehicles', 'equipment', '{"category": "vehicle", "status": "all"}', 'All vehicles in fleet', 'truck', 4)
ON CONFLICT (preset_name, preset_type) DO UPDATE SET filter_config = EXCLUDED.filter_config;

-- =====================================================
-- 9. POPULATE AUTOCOMPLETE SUGGESTIONS
-- =====================================================

-- Project name suggestions
INSERT INTO autocomplete_suggestions (suggestion_type, suggestion_text, usage_count, confidence_score)
SELECT DISTINCT
    'project_name',
    SUBSTRING(name FROM 1 FOR 50),
    (random() * 100)::int,
    0.9 + random() * 0.1
FROM projects
WHERE name IS NOT NULL
ON CONFLICT (suggestion_type, suggestion_text) DO UPDATE SET usage_count = autocomplete_suggestions.usage_count + 1;

-- Staff skill suggestions
INSERT INTO autocomplete_suggestions (suggestion_type, suggestion_text, usage_count, confidence_score) VALUES
-- Technical skills
('staff_skill', 'Fiber Splicing', 95, 1.0),
('staff_skill', 'OTDR Testing', 88, 1.0),
('staff_skill', 'Cable Pulling', 92, 0.95),
('staff_skill', 'Fusion Splicing', 85, 1.0),
('staff_skill', 'Network Design', 78, 0.95),
('staff_skill', 'Project Management', 82, 0.95),
('staff_skill', 'CAD Drafting', 65, 0.9),
('staff_skill', 'Permit Acquisition', 58, 0.9),
('staff_skill', 'Quality Assurance', 72, 0.9),
('staff_skill', 'Safety Compliance', 88, 0.95),
('staff_skill', 'Underground Construction', 76, 0.9),
('staff_skill', 'Aerial Construction', 74, 0.9),
('staff_skill', 'Directional Drilling', 62, 0.9),
('staff_skill', 'Trenching', 68, 0.85),
('staff_skill', 'Restoration', 64, 0.85),
('staff_skill', 'Power Meter Testing', 71, 0.9),
('staff_skill', 'Visual Fault Location', 69, 0.9),
('staff_skill', 'Connector Installation', 73, 0.9),
('staff_skill', 'Cable Termination', 70, 0.9),
('staff_skill', 'Network Troubleshooting', 77, 0.95),
-- Certifications
('staff_skill', 'OSHA 30', 55, 0.85),
('staff_skill', 'CDL License', 48, 0.85),
('staff_skill', 'First Aid Certified', 62, 0.85),
('staff_skill', 'Confined Space Entry', 45, 0.85),
('staff_skill', 'Aerial Lift Certified', 52, 0.85)
ON CONFLICT (suggestion_type, suggestion_text) DO UPDATE SET usage_count = autocomplete_suggestions.usage_count + 1;

-- Location suggestions
INSERT INTO autocomplete_suggestions (suggestion_type, suggestion_text, parent_text, usage_count, confidence_score) VALUES
-- Cities
('location', 'New York', 'NY', 120, 1.0),
('location', 'Los Angeles', 'CA', 115, 1.0),
('location', 'Chicago', 'IL', 108, 1.0),
('location', 'Houston', 'TX', 102, 1.0),
('location', 'Phoenix', 'AZ', 95, 0.95),
('location', 'Philadelphia', 'PA', 92, 0.95),
('location', 'San Antonio', 'TX', 88, 0.95),
('location', 'San Diego', 'CA', 85, 0.95),
('location', 'Dallas', 'TX', 98, 0.95),
('location', 'San Jose', 'CA', 82, 0.9),
('location', 'Austin', 'TX', 89, 0.95),
('location', 'Jacksonville', 'FL', 75, 0.9),
('location', 'Fort Worth', 'TX', 72, 0.9),
('location', 'Columbus', 'OH', 70, 0.9),
('location', 'Charlotte', 'NC', 78, 0.9),
('location', 'San Francisco', 'CA', 95, 0.95),
('location', 'Indianapolis', 'IN', 68, 0.85),
('location', 'Seattle', 'WA', 92, 0.95),
('location', 'Denver', 'CO', 88, 0.95),
('location', 'Boston', 'MA', 90, 0.95),
-- Regions
('location', 'Northeast Region', NULL, 65, 0.9),
('location', 'Southeast Region', NULL, 62, 0.9),
('location', 'Midwest Region', NULL, 58, 0.9),
('location', 'Southwest Region', NULL, 60, 0.9),
('location', 'West Coast', NULL, 70, 0.9)
ON CONFLICT (suggestion_type, suggestion_text) DO UPDATE SET usage_count = autocomplete_suggestions.usage_count + 1;

-- Equipment model numbers
INSERT INTO autocomplete_suggestions (suggestion_type, suggestion_text, parent_text, usage_count, confidence_score) VALUES
-- OTDR Models
('equipment', 'EXFO FTB-730C', 'OTDR', 45, 0.95),
('equipment', 'VIAVI MTS-2000', 'OTDR', 42, 0.95),
('equipment', 'Yokogawa AQ7280', 'OTDR', 38, 0.9),
('equipment', 'AFL FlexScan FS200', 'OTDR', 35, 0.9),
-- Fusion Splicers
('equipment', 'Fujikura 90S', 'Fusion Splicer', 52, 1.0),
('equipment', 'Sumitomo T-72C', 'Fusion Splicer', 48, 0.95),
('equipment', 'INNO View 7', 'Fusion Splicer', 44, 0.95),
('equipment', 'Furukawa S179', 'Fusion Splicer', 40, 0.9),
-- Power Meters
('equipment', 'EXFO PPM-350C', 'Power Meter', 32, 0.9),
('equipment', 'VIAVI OLP-85', 'Power Meter', 30, 0.9),
('equipment', 'Kingfisher KI9600', 'Power Meter', 28, 0.85),
-- Vehicles
('equipment', 'Ford F-550', 'Bucket Truck', 25, 0.9),
('equipment', 'International 4300', 'Cable Truck', 23, 0.9),
('equipment', 'Freightliner M2', 'Splice Van', 22, 0.85),
('equipment', 'Ford Transit 350', 'Service Van', 24, 0.9),
-- Tools
('equipment', 'Miller Fiber Optic Stripper', 'Hand Tool', 35, 0.85),
('equipment', 'Ripley Cablematic', 'Cable Prep Tool', 32, 0.85),
('equipment', 'Greenlee Cable Puller', 'Pulling Equipment', 30, 0.85),
('equipment', 'Ditch Witch JT20', 'Directional Drill', 28, 0.9)
ON CONFLICT (suggestion_type, suggestion_text) DO UPDATE SET usage_count = autocomplete_suggestions.usage_count + 1;

-- =====================================================
-- 10. POPULATE SAVED FILTERS (Sample User Filters)
-- =====================================================

INSERT INTO saved_filters (user_id, filter_name, filter_type, filter_config, is_default) VALUES
('user_1', 'My Active Projects', 'projects', '{"status": "active", "assigned_to": "user_1", "sort": "deadline_asc"}', true),
('user_1', 'High Priority Tasks', 'projects', '{"priority": "high", "status": ["active", "pending"]}', false),
('user_1', 'Team Members', 'staff', '{"department": "Engineering", "status": "active"}', true),
('user_2', 'This Week Installations', 'projects', '{"project_type": "installation", "date_range": "this_week"}', true),
('user_2', 'Available Equipment', 'equipment', '{"status": "available", "location": "Main Warehouse"}', false),
('user_3', 'Overdue Maintenance', 'equipment', '{"maintenance_status": "overdue", "sort": "last_maintenance_asc"}', false),
('user_3', 'Contractor Performance', 'contractors', '{"rating": ">4", "status": "active"}', true),
('user_4', 'Budget Variance', 'projects', '{"budget_variance": ">10%", "status": "active"}', false),
('user_5', 'Certification Expiry', 'staff', '{"certification_expiry": "next_30_days"}', true),
('user_5', 'Rural Projects', 'projects', '{"project_area": "rural", "status": "all"}', false)
ON CONFLICT (user_id, filter_name, filter_type) DO NOTHING;

-- =====================================================
-- 11. CREATE SEARCH FUNCTIONS
-- =====================================================

-- Function for searching projects with relevance ranking
CREATE OR REPLACE FUNCTION search_projects(query_text TEXT)
RETURNS TABLE(
    project_id INTEGER,
    project_name TEXT,
    relevance FLOAT,
    snippet TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        ts_rank_cd(p.search_vector, plainto_tsquery('english', query_text)) AS relevance,
        ts_headline('english', 
            COALESCE(p.name, '') || ' ' || COALESCE(p.description, ''),
            plainto_tsquery('english', query_text),
            'StartSel=<b>, StopSel=</b>, MaxWords=20, MinWords=10'
        ) AS snippet
    FROM projects p
    WHERE p.search_vector @@ plainto_tsquery('english', query_text)
    ORDER BY relevance DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function for multi-table global search
CREATE OR REPLACE FUNCTION global_search(query_text TEXT, max_results INTEGER DEFAULT 20)
RETURNS TABLE(
    result_type TEXT,
    result_id INTEGER,
    result_title TEXT,
    relevance FLOAT,
    snippet TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Search projects
    SELECT 
        'project'::TEXT,
        p.id,
        p.name::TEXT,
        ts_rank_cd(p.search_vector, plainto_tsquery('english', query_text)),
        ts_headline('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, ''),
            plainto_tsquery('english', query_text))::TEXT
    FROM projects p
    WHERE p.search_vector @@ plainto_tsquery('english', query_text)
    
    UNION ALL
    
    -- Search staff
    SELECT 
        'staff'::TEXT,
        s.id,
        (s.first_name || ' ' || s.last_name)::TEXT,
        ts_rank_cd(s.search_vector, plainto_tsquery('english', query_text)),
        ts_headline('english', COALESCE(s.first_name || ' ' || s.last_name, '') || ' - ' || COALESCE(s.role, ''),
            plainto_tsquery('english', query_text))::TEXT
    FROM staff s
    WHERE s.search_vector @@ plainto_tsquery('english', query_text)
    
    UNION ALL
    
    -- Search clients
    SELECT 
        'client'::TEXT,
        c.id,
        c.name::TEXT,
        ts_rank_cd(c.search_vector, plainto_tsquery('english', query_text)),
        ts_headline('english', COALESCE(c.name, '') || ' - ' || COALESCE(c.company_name, ''),
            plainto_tsquery('english', query_text))::TEXT
    FROM clients c
    WHERE c.search_vector @@ plainto_tsquery('english', query_text)
    
    ORDER BY relevance DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. CREATE TRIGGERS FOR AUTO-UPDATING SEARCH VECTORS
-- =====================================================

-- Trigger function to update search vectors
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
    IF TG_TABLE_NAME = 'projects' THEN
        NEW.search_vector := 
            setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.client_name, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.project_type, '')), 'C') ||
            setweight(to_tsvector('english', COALESCE(NEW.status, '')), 'C') ||
            setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'D');
    ELSIF TG_TABLE_NAME = 'staff' THEN
        NEW.search_vector := 
            setweight(to_tsvector('english', COALESCE(NEW.first_name || ' ' || NEW.last_name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.role, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.department, '')), 'C') ||
            setweight(to_tsvector('english', COALESCE(NEW.skills, '')), 'C');
    ELSIF TG_TABLE_NAME = 'clients' THEN
        NEW.search_vector := 
            setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'C');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updates
DROP TRIGGER IF EXISTS update_projects_search_vector ON projects;
CREATE TRIGGER update_projects_search_vector 
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS update_staff_search_vector ON staff;
CREATE TRIGGER update_staff_search_vector 
BEFORE INSERT OR UPDATE ON staff
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS update_clients_search_vector ON clients;
CREATE TRIGGER update_clients_search_vector 
BEFORE INSERT OR UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- =====================================================
-- 13. POPULATE SEARCH METRICS
-- =====================================================

INSERT INTO search_metrics (metric_date, search_type, total_searches, avg_duration_ms, failed_searches, unique_users)
SELECT 
    date_trunc('day', created_at)::date,
    search_type,
    COUNT(*),
    AVG(search_duration_ms),
    SUM(CASE WHEN result_count = 0 THEN 1 ELSE 0 END)::INTEGER,
    COUNT(DISTINCT user_id)::INTEGER
FROM search_history
GROUP BY date_trunc('day', created_at)::date, search_type
ON CONFLICT (metric_date, search_type) 
DO UPDATE SET 
    total_searches = EXCLUDED.total_searches,
    avg_duration_ms = EXCLUDED.avg_duration_ms;

-- =====================================================
-- 14. CREATE MATERIALIZED VIEW FOR SEARCH SUGGESTIONS
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS search_suggestions AS
SELECT 
    'recent' as suggestion_category,
    search_query as suggestion,
    COUNT(*) as popularity,
    MAX(created_at) as last_used
FROM search_history
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY search_query
HAVING COUNT(*) > 2

UNION ALL

SELECT 
    'popular' as suggestion_category,
    search_term as suggestion,
    search_count as popularity,
    last_searched as last_used
FROM popular_searches
WHERE search_count > 5

UNION ALL

SELECT 
    'trending' as suggestion_category,
    search_query as suggestion,
    COUNT(*) as popularity,
    MAX(created_at) as last_used
FROM search_history
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY search_query
HAVING COUNT(*) > 3

ORDER BY popularity DESC, last_used DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_search_suggestions ON search_suggestions(suggestion_category, popularity DESC);

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW search_suggestions;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify search metadata tables
SELECT 'Search Infrastructure Created Successfully!' as status;

-- Show table counts
SELECT 
    'search_synonyms' as table_name, COUNT(*) as record_count FROM search_synonyms
UNION ALL
SELECT 'search_history', COUNT(*) FROM search_history
UNION ALL
SELECT 'popular_searches', COUNT(*) FROM popular_searches
UNION ALL
SELECT 'filter_presets', COUNT(*) FROM filter_presets
UNION ALL
SELECT 'autocomplete_suggestions', COUNT(*) FROM autocomplete_suggestions
UNION ALL
SELECT 'search_metrics', COUNT(*) FROM search_metrics;

-- Test global search function
-- SELECT * FROM global_search('fiber installation', 10);

-- Test project search function
-- SELECT * FROM search_projects('active project');

COMMIT;