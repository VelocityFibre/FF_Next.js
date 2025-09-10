-- Contractors Management System - Database Schema
-- Creates tables for contractors, teams, documents, and related data

-- Main contractors table
CREATE TABLE IF NOT EXISTS contractors (
    id SERIAL PRIMARY KEY,
    
    -- Company Information
    company_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    business_type VARCHAR(50) CHECK (business_type IN ('pty_ltd', 'cc', 'sole_proprietor', 'partnership')),
    industry_category VARCHAR(100),
    years_in_business INTEGER,
    employee_count INTEGER,
    
    -- Contact Information
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    
    -- Address
    physical_address TEXT,
    postal_address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Financial Information
    annual_turnover DECIMAL(15, 2),
    credit_rating VARCHAR(50),
    payment_terms VARCHAR(100),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    branch_code VARCHAR(20),
    
    -- Status & Compliance
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'blacklisted', 'under_review')),
    is_active BOOLEAN DEFAULT true,
    compliance_status VARCHAR(50) DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'non_compliant', 'under_review')),
    
    -- RAG Scoring
    rag_overall VARCHAR(10) DEFAULT 'amber' CHECK (rag_overall IN ('red', 'amber', 'green')),
    rag_financial VARCHAR(10) DEFAULT 'amber' CHECK (rag_financial IN ('red', 'amber', 'green')),
    rag_compliance VARCHAR(10) DEFAULT 'amber' CHECK (rag_compliance IN ('red', 'amber', 'green')),
    rag_performance VARCHAR(10) DEFAULT 'amber' CHECK (rag_performance IN ('red', 'amber', 'green')),
    rag_safety VARCHAR(10) DEFAULT 'amber' CHECK (rag_safety IN ('red', 'amber', 'green')),
    
    -- Performance Metrics
    performance_score DECIMAL(5, 2),
    safety_score DECIMAL(5, 2),
    quality_score DECIMAL(5, 2),
    timeliness_score DECIMAL(5, 2),
    
    -- Contractor Specializations (stored as JSON array)
    specializations JSONB DEFAULT '[]',
    
    -- Project Statistics
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    cancelled_projects INTEGER DEFAULT 0,
    
    -- Additional Project Metrics
    success_rate DECIMAL(5, 2),
    on_time_completion DECIMAL(5, 2),
    average_project_value DECIMAL(15, 2),
    
    -- Contractor Certifications (stored as JSON array)
    certifications JSONB DEFAULT '[]',
    
    -- Onboarding
    onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    documents_expiring INTEGER DEFAULT 0,
    
    -- Metadata
    notes TEXT,
    tags JSONB DEFAULT '[]',
    last_activity TIMESTAMP WITH TIME ZONE,
    next_review_date DATE,
    
    -- Audit
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contractor teams table
CREATE TABLE IF NOT EXISTS contractor_teams (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    
    -- Team Information
    team_name VARCHAR(255) NOT NULL,
    team_type VARCHAR(50) CHECK (team_type IN ('installation', 'maintenance', 'survey', 'fiber_splicing', 'excavation', 'other')),
    team_size INTEGER NOT NULL,
    
    -- Team Lead
    lead_name VARCHAR(255),
    lead_phone VARCHAR(50),
    lead_email VARCHAR(255),
    lead_certification VARCHAR(255),
    
    -- Team Details
    members JSONB DEFAULT '[]', -- Array of team member objects
    specializations JSONB DEFAULT '[]',
    equipment_available JSONB DEFAULT '[]',
    service_areas JSONB DEFAULT '[]',
    
    -- Availability & Capacity
    availability VARCHAR(50) DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'on_leave', 'inactive')),
    current_workload INTEGER DEFAULT 0,
    max_capacity INTEGER DEFAULT 5,
    
    -- Performance
    team_rating DECIMAL(3, 2),
    projects_completed INTEGER DEFAULT 0,
    average_completion_time DECIMAL(10, 2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_assignment_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    
    -- Audit
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(contractor_id, team_name)
);

-- Contractor documents table
CREATE TABLE IF NOT EXISTS contractor_documents (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    
    -- Document Information
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(100),
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Storage path (not actual file)
    file_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Document Validity
    issue_date DATE,
    expiry_date DATE,
    is_expired BOOLEAN DEFAULT false,
    days_until_expiry INTEGER,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'replaced')),
    rejection_reason TEXT,
    
    -- Metadata
    notes TEXT,
    tags JSONB DEFAULT '[]',
    
    -- Audit
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RAG score history table
CREATE TABLE IF NOT EXISTS contractor_rag_history (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    
    -- Score Information
    score_type VARCHAR(50) NOT NULL CHECK (score_type IN ('overall', 'financial', 'compliance', 'performance', 'safety')),
    old_score VARCHAR(10) CHECK (old_score IN ('red', 'amber', 'green')),
    new_score VARCHAR(10) NOT NULL CHECK (new_score IN ('red', 'amber', 'green')),
    
    -- Change Details
    change_reason TEXT,
    assessment_data JSONB,
    
    -- Metadata
    changed_by VARCHAR(255),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contractor onboarding stages table
CREATE TABLE IF NOT EXISTS contractor_onboarding_stages (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    
    -- Stage Information
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    
    -- Progress
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    completion_percentage INTEGER DEFAULT 0,
    
    -- Requirements
    required_documents JSONB DEFAULT '[]',
    completed_documents JSONB DEFAULT '[]',
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    
    -- Metadata
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(contractor_id, stage_name)
);

-- Create indexes for better query performance
CREATE INDEX idx_contractors_status ON contractors(status);
CREATE INDEX idx_contractors_compliance ON contractors(compliance_status);
CREATE INDEX idx_contractors_rag_overall ON contractors(rag_overall);
CREATE INDEX idx_contractors_is_active ON contractors(is_active);
CREATE INDEX idx_contractors_email ON contractors(email);
CREATE INDEX idx_contractors_registration ON contractors(registration_number);

CREATE INDEX idx_contractor_teams_contractor ON contractor_teams(contractor_id);
CREATE INDEX idx_contractor_teams_availability ON contractor_teams(availability);
CREATE INDEX idx_contractor_teams_type ON contractor_teams(team_type);

CREATE INDEX idx_contractor_documents_contractor ON contractor_documents(contractor_id);
CREATE INDEX idx_contractor_documents_type ON contractor_documents(document_type);
CREATE INDEX idx_contractor_documents_expiry ON contractor_documents(expiry_date);
CREATE INDEX idx_contractor_documents_status ON contractor_documents(status);

CREATE INDEX idx_contractor_rag_history_contractor ON contractor_rag_history(contractor_id);
CREATE INDEX idx_contractor_rag_history_type ON contractor_rag_history(score_type);

CREATE INDEX idx_contractor_onboarding_contractor ON contractor_onboarding_stages(contractor_id);
CREATE INDEX idx_contractor_onboarding_status ON contractor_onboarding_stages(status);

-- Create update trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_teams_updated_at BEFORE UPDATE ON contractor_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_documents_updated_at BEFORE UPDATE ON contractor_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_onboarding_stages_updated_at BEFORE UPDATE ON contractor_onboarding_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();