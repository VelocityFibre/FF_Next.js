-- =====================================================
-- NEON DATABASE COMPLETE SCHEMA MIGRATION
-- =====================================================
-- This migration creates the complete database schema for FibreFlow
-- Including all tables, indexes, views, triggers, and functions
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- =====================================================
-- SECTION 1: CORE TABLES
-- =====================================================

-- Users table (Clerk integration)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    permissions JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    contact_person VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    website VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    annual_revenue DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    tags VARCHAR(255)[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    description TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_manager_id UUID REFERENCES users(id),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'planning',
    priority VARCHAR(20) DEFAULT 'medium',
    type VARCHAR(50),
    location JSONB,
    tags VARCHAR(255)[],
    milestones JSONB DEFAULT '[]'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(100) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    role VARCHAR(50),
    hire_date DATE,
    birth_date DATE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact JSONB,
    skills VARCHAR(255)[],
    certifications JSONB DEFAULT '[]'::jsonb,
    availability_status VARCHAR(50) DEFAULT 'available',
    hourly_rate DECIMAL(10,2),
    salary DECIMAL(12,2),
    contract_type VARCHAR(50),
    manager_id UUID REFERENCES staff(id),
    user_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- SECTION 2: CONTRACTOR TABLES
-- =====================================================

-- Contractors table
CREATE TABLE IF NOT EXISTS contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    tax_id VARCHAR(100),
    contact_person VARCHAR(200),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    website VARCHAR(255),
    specializations VARCHAR(255)[],
    rating DECIMAL(3,2),
    insurance_info JSONB,
    certifications JSONB DEFAULT '[]'::jsonb,
    bank_details JSONB,
    payment_terms VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    onboarding_status VARCHAR(50) DEFAULT 'incomplete',
    onboarding_progress INTEGER DEFAULT 0,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Contractor documents
CREATE TABLE IF NOT EXISTS contractor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Contractor team members
CREATE TABLE IF NOT EXISTS contractor_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    certifications VARCHAR(255)[],
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contractor projects
CREATE TABLE IF NOT EXISTS contractor_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    contract_value DECIMAL(15,2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    performance_rating DECIMAL(3,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contractor_id, project_id)
);

-- =====================================================
-- SECTION 3: SUPPLIER TABLES
-- =====================================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    contact_person VARCHAR(200),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    website VARCHAR(255),
    categories VARCHAR(255)[],
    products VARCHAR(255)[],
    rating DECIMAL(3,2),
    credit_limit DECIMAL(15,2),
    payment_terms VARCHAR(100),
    lead_time_days INTEGER,
    minimum_order_value DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active',
    compliance_status VARCHAR(50) DEFAULT 'pending',
    compliance_expiry DATE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Supplier documents
CREATE TABLE IF NOT EXISTS supplier_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Supplier ratings
CREATE TABLE IF NOT EXISTS supplier_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    rated_by UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    quality_rating DECIMAL(3,2),
    delivery_rating DECIMAL(3,2),
    price_rating DECIMAL(3,2),
    service_rating DECIMAL(3,2),
    overall_rating DECIMAL(3,2),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECTION 4: PROCUREMENT TABLES (RFQ/BOQ)
-- =====================================================

-- Products catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    sub_category VARCHAR(100),
    unit VARCHAR(50),
    base_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    specifications JSONB,
    images VARCHAR(255)[],
    manufacturer VARCHAR(200),
    model_number VARCHAR(100),
    weight DECIMAL(10,3),
    dimensions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- BOQ (Bill of Quantities)
CREATE TABLE IF NOT EXISTS boq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    boq_number VARCHAR(100) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft',
    total_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    prepared_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- BOQ items
CREATE TABLE IF NOT EXISTS boq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID REFERENCES boq(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    item_code VARCHAR(100),
    description TEXT NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(15,2),
    category VARCHAR(100),
    specifications JSONB,
    notes TEXT,
    sort_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RFQ (Request for Quotation)
CREATE TABLE IF NOT EXISTS rfq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_number VARCHAR(100) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id),
    boq_id UUID REFERENCES boq(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    submission_deadline TIMESTAMP WITH TIME ZONE,
    delivery_date DATE,
    delivery_location TEXT,
    payment_terms TEXT,
    special_conditions TEXT,
    evaluation_criteria JSONB,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RFQ suppliers (invited suppliers)
CREATE TABLE IF NOT EXISTS rfq_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES rfq(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    response_received_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'invited',
    total_quoted_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    validity_days INTEGER,
    delivery_days INTEGER,
    payment_terms TEXT,
    notes TEXT,
    ranking INTEGER,
    is_selected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfq_id, supplier_id)
);

-- RFQ responses (quotations from suppliers)
CREATE TABLE IF NOT EXISTS rfq_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES rfq(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    rfq_supplier_id UUID REFERENCES rfq_suppliers(id) ON DELETE CASCADE,
    quotation_number VARCHAR(100),
    total_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    validity_until DATE,
    delivery_date DATE,
    payment_terms TEXT,
    warranty_terms TEXT,
    special_conditions TEXT,
    attachments VARCHAR(255)[],
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    evaluated_by UUID REFERENCES users(id),
    evaluated_at TIMESTAMP WITH TIME ZONE,
    evaluation_notes TEXT,
    score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RFQ response items (line items in quotations)
CREATE TABLE IF NOT EXISTS rfq_response_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_response_id UUID REFERENCES rfq_responses(id) ON DELETE CASCADE,
    boq_item_id UUID REFERENCES boq_items(id),
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(15,2),
    discount_percent DECIMAL(5,2),
    discount_amount DECIMAL(12,2),
    tax_percent DECIMAL(5,2),
    tax_amount DECIMAL(12,2),
    final_price DECIMAL(15,2),
    lead_time_days INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECTION 5: PROJECT MANAGEMENT TABLES
-- =====================================================

-- Project phases
CREATE TABLE IF NOT EXISTS project_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase_number INTEGER,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    budget_allocated DECIMAL(15,2),
    budget_spent DECIMAL(15,2),
    responsible_id UUID REFERENCES users(id),
    dependencies JSONB DEFAULT '[]'::jsonb,
    deliverables JSONB DEFAULT '[]'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES project_phases(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id),
    assigned_staff_id UUID REFERENCES staff(id),
    start_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    tags VARCHAR(255)[],
    dependencies UUID[],
    attachments VARCHAR(255)[],
    checklist JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Task comments
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    attachments VARCHAR(255)[],
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- SECTION 6: SOW (Statement of Work) TABLES
-- =====================================================

-- SOW documents
CREATE TABLE IF NOT EXISTS sow_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_number VARCHAR(100) UNIQUE,
    version VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    prepared_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    effective_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Poles tracking
CREATE TABLE IF NOT EXISTS poles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    pole_number VARCHAR(100) NOT NULL,
    pole_type VARCHAR(50),
    material VARCHAR(50),
    height_meters DECIMAL(5,2),
    location JSONB,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address TEXT,
    status VARCHAR(50) DEFAULT 'planned',
    installation_date DATE,
    inspection_date DATE,
    next_maintenance_date DATE,
    condition VARCHAR(50),
    owner VARCHAR(100),
    notes TEXT,
    photos VARCHAR(255)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(project_id, pole_number)
);

-- Drops (customer connections)
CREATE TABLE IF NOT EXISTS drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    pole_id UUID REFERENCES poles(id),
    drop_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(200),
    customer_address TEXT,
    drop_type VARCHAR(50),
    cable_type VARCHAR(50),
    cable_length_meters DECIMAL(8,2),
    status VARCHAR(50) DEFAULT 'planned',
    installation_date DATE,
    technician_id UUID REFERENCES staff(id),
    connection_type VARCHAR(50),
    signal_strength DECIMAL(5,2),
    notes TEXT,
    photos VARCHAR(255)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(project_id, drop_number)
);

-- Fiber sections
CREATE TABLE IF NOT EXISTS fiber_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    section_name VARCHAR(200) NOT NULL,
    from_pole_id UUID REFERENCES poles(id),
    to_pole_id UUID REFERENCES poles(id),
    cable_type VARCHAR(100),
    fiber_count INTEGER,
    length_meters DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'planned',
    installation_date DATE,
    tested_date DATE,
    test_results JSONB,
    contractor_id UUID REFERENCES contractors(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- SECTION 7: SUPPORT TABLES
-- =====================================================

-- Files table (general file storage)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'task', 'user', etc.
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    storage_provider VARCHAR(50) DEFAULT 'local',
    is_public BOOLEAN DEFAULT false,
    tags VARCHAR(255)[],
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, key)
);

-- =====================================================
-- SECTION 8: ONEMAP TABLES (Already exist, included for completeness)
-- =====================================================

-- Reference to existing OneMap tables
-- These are already created but included here for documentation
-- - onemap_daily_tracker
-- - onemap_daily_images
-- - onemap_pole_data
-- - onemap_import_tracking

-- =====================================================
-- SECTION 9: INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Clients indexes
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Projects indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_manager ON projects(project_manager_id);

-- Staff indexes
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_availability ON staff(availability_status);
CREATE INDEX idx_staff_active ON staff(is_active) WHERE is_active = true;

-- Contractors indexes
CREATE INDEX idx_contractors_status ON contractors(status);
CREATE INDEX idx_contractors_onboarding ON contractors(onboarding_status);
CREATE INDEX idx_contractors_specializations ON contractors USING gin(specializations);

-- Suppliers indexes
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_categories ON suppliers USING gin(categories);
CREATE INDEX idx_suppliers_compliance ON suppliers(compliance_status);

-- Products indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category, sub_category);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- BOQ indexes
CREATE INDEX idx_boq_project ON boq(project_id);
CREATE INDEX idx_boq_status ON boq(status);
CREATE INDEX idx_boq_items_boq ON boq_items(boq_id);

-- RFQ indexes
CREATE INDEX idx_rfq_project ON rfq(project_id);
CREATE INDEX idx_rfq_status ON rfq(status);
CREATE INDEX idx_rfq_deadline ON rfq(submission_deadline);
CREATE INDEX idx_rfq_suppliers_rfq ON rfq_suppliers(rfq_id);
CREATE INDEX idx_rfq_suppliers_supplier ON rfq_suppliers(supplier_id);
CREATE INDEX idx_rfq_responses_rfq ON rfq_responses(rfq_id);
CREATE INDEX idx_rfq_responses_supplier ON rfq_responses(supplier_id);

-- Tasks indexes
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_phase ON tasks(phase_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to, assigned_staff_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_dates ON tasks(start_date, due_date);

-- Poles indexes
CREATE INDEX idx_poles_project ON poles(project_id);
CREATE INDEX idx_poles_status ON poles(status);
CREATE INDEX idx_poles_location ON poles USING gist(location);

-- Drops indexes
CREATE INDEX idx_drops_project ON drops(project_id);
CREATE INDEX idx_drops_pole ON drops(pole_id);
CREATE INDEX idx_drops_status ON drops(status);

-- Files indexes
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Full text search indexes
CREATE INDEX idx_projects_search ON projects USING gin(
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);

CREATE INDEX idx_clients_search ON clients USING gin(
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(notes, ''))
);

CREATE INDEX idx_staff_search ON staff USING gin(
    to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, ''))
);

-- =====================================================
-- SECTION 10: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END$$;

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs(user_id, action, entity_type, entity_id, new_values)
        VALUES (current_setting('app.current_user_id', true)::uuid, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs(user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (current_setting('app.current_user_id', true)::uuid, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs(user_id, action, entity_type, entity_id, old_values)
        VALUES (current_setting('app.current_user_id', true)::uuid, TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_contractors AFTER INSERT OR UPDATE OR DELETE ON contractors
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_suppliers AFTER INSERT OR UPDATE OR DELETE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_rfq AFTER INSERT OR UPDATE OR DELETE ON rfq
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_boq AFTER INSERT OR UPDATE OR DELETE ON boq
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to calculate project progress
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress DECIMAL;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_tasks, completed_tasks
    FROM tasks
    WHERE project_id = p_project_id;
    
    IF total_tasks > 0 THEN
        progress := (completed_tasks::DECIMAL / total_tasks) * 100;
    ELSE
        progress := 0;
    END IF;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next sequence number
CREATE OR REPLACE FUNCTION generate_next_number(prefix VARCHAR, table_name VARCHAR, column_name VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    max_num INTEGER;
    next_num VARCHAR;
BEGIN
    EXECUTE format('SELECT MAX(CAST(SUBSTRING(%I FROM %L) AS INTEGER)) FROM %I WHERE %I LIKE %L',
                   column_name, length(prefix) + 2, table_name, column_name, prefix || '-%')
    INTO max_num;
    
    IF max_num IS NULL THEN
        max_num := 0;
    END IF;
    
    next_num := prefix || '-' || LPAD((max_num + 1)::TEXT, 6, '0');
    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 11: VIEWS FOR COMPLEX QUERIES
-- =====================================================

-- Project summary view
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.id,
    p.name,
    p.code,
    p.status,
    p.start_date,
    p.end_date,
    p.budget,
    c.name as client_name,
    u.display_name as project_manager,
    calculate_project_progress(p.id) as progress_percentage,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
    COUNT(DISTINCT ph.id) as total_phases,
    COUNT(DISTINCT s.id) as total_staff,
    COUNT(DISTINCT co.id) as total_contractors,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN users u ON p.project_manager_id = u.id
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN project_phases ph ON p.id = ph.project_id
LEFT JOIN contractor_projects cp ON p.id = cp.project_id
LEFT JOIN contractors co ON cp.contractor_id = co.id
LEFT JOIN (
    SELECT DISTINCT project_id, assigned_staff_id as id 
    FROM tasks 
    WHERE assigned_staff_id IS NOT NULL
) s ON p.id = s.project_id
GROUP BY p.id, c.name, u.display_name;

-- Supplier ratings view
CREATE OR REPLACE VIEW supplier_ratings_summary AS
SELECT 
    s.id,
    s.name,
    s.code,
    s.status,
    COUNT(sr.id) as total_ratings,
    AVG(sr.overall_rating) as avg_rating,
    AVG(sr.quality_rating) as avg_quality,
    AVG(sr.delivery_rating) as avg_delivery,
    AVG(sr.price_rating) as avg_price,
    AVG(sr.service_rating) as avg_service,
    MAX(sr.created_at) as last_rated,
    COUNT(DISTINCT rqs.rfq_id) as total_rfqs,
    COUNT(DISTINCT rqs.rfq_id) FILTER (WHERE rqs.is_selected = true) as won_rfqs,
    s.created_at
FROM suppliers s
LEFT JOIN supplier_ratings sr ON s.id = sr.supplier_id
LEFT JOIN rfq_suppliers rqs ON s.id = rqs.supplier_id
GROUP BY s.id;

-- Contractor performance view
CREATE OR REPLACE VIEW contractor_performance AS
SELECT 
    c.id,
    c.company_name,
    c.status,
    c.onboarding_status,
    c.rating,
    COUNT(DISTINCT cp.project_id) as total_projects,
    COUNT(DISTINCT cp.project_id) FILTER (WHERE cp.status = 'completed') as completed_projects,
    AVG(cp.performance_rating) as avg_performance,
    SUM(cp.contract_value) as total_contract_value,
    COUNT(DISTINCT tm.id) as team_size,
    COUNT(DISTINCT cd.id) as total_documents,
    COUNT(DISTINCT cd.id) FILTER (WHERE cd.is_verified = true) as verified_documents,
    c.created_at
FROM contractors c
LEFT JOIN contractor_projects cp ON c.id = cp.contractor_id
LEFT JOIN contractor_team_members tm ON c.id = tm.contractor_id AND tm.is_active = true
LEFT JOIN contractor_documents cd ON c.id = cd.contractor_id
GROUP BY c.id;

-- Staff utilization view
CREATE OR REPLACE VIEW staff_utilization AS
SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.department,
    s.position,
    s.availability_status,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'in_progress') as active_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    SUM(t.estimated_hours) as total_estimated_hours,
    SUM(t.actual_hours) as total_actual_hours,
    COUNT(DISTINCT t.project_id) as projects_count,
    s.hourly_rate,
    s.is_active
FROM staff s
LEFT JOIN tasks t ON s.id = t.assigned_staff_id
GROUP BY s.id;

-- RFQ status view
CREATE OR REPLACE VIEW rfq_status_summary AS
SELECT 
    r.id,
    r.rfq_number,
    r.title,
    r.status,
    r.submission_deadline,
    p.name as project_name,
    b.boq_number,
    COUNT(DISTINCT rs.supplier_id) as invited_suppliers,
    COUNT(DISTINCT rr.id) as responses_received,
    MIN(rr.total_amount) as lowest_quote,
    MAX(rr.total_amount) as highest_quote,
    AVG(rr.total_amount) as average_quote,
    r.created_at,
    r.published_at,
    r.closed_at
FROM rfq r
LEFT JOIN projects p ON r.project_id = p.id
LEFT JOIN boq b ON r.boq_id = b.id
LEFT JOIN rfq_suppliers rs ON r.id = rs.rfq_id
LEFT JOIN rfq_responses rr ON r.id = rr.rfq_id
GROUP BY r.id, p.name, b.boq_number;

-- =====================================================
-- SECTION 12: MATERIALIZED VIEWS FOR DASHBOARD
-- =====================================================

-- Dashboard statistics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'completed') as completed_projects,
    (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress') as active_tasks,
    (SELECT COUNT(*) FROM staff WHERE is_active = true) as active_staff,
    (SELECT COUNT(*) FROM contractors WHERE status = 'active') as active_contractors,
    (SELECT COUNT(*) FROM suppliers WHERE status = 'active') as active_suppliers,
    (SELECT COUNT(*) FROM rfq WHERE status = 'open') as open_rfqs,
    (SELECT SUM(budget) FROM projects WHERE status = 'active') as total_active_budget,
    (SELECT AVG(calculate_project_progress(id)) FROM projects WHERE status = 'active') as avg_project_progress,
    CURRENT_TIMESTAMP as last_updated;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_dashboard_stats_unique ON dashboard_stats(last_updated);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 13: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your requirements)
-- Users can see their own record
CREATE POLICY users_self_select ON users
    FOR SELECT
    USING (id = current_setting('app.current_user_id', true)::uuid OR 
           'admin' = current_setting('app.user_role', true));

-- Project access based on team membership
CREATE POLICY projects_team_access ON projects
    FOR ALL
    USING (
        project_manager_id = current_setting('app.current_user_id', true)::uuid OR
        id IN (
            SELECT project_id FROM tasks 
            WHERE assigned_to = current_setting('app.current_user_id', true)::uuid
        ) OR
        'admin' = current_setting('app.user_role', true)
    );

-- =====================================================
-- SECTION 14: GRANTS AND PERMISSIONS
-- =====================================================

-- Create application role if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user;
    END IF;
END$$;

-- Grant permissions to app_user role
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Database schema migration completed successfully!';
    RAISE NOTICE 'Tables created: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE 'Indexes created: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
    RAISE NOTICE 'Views created: %', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public');
END$$;