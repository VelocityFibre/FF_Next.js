-- Create Document Management Tables for FibreFlow
-- This script creates all necessary tables for comprehensive document management

-- Document Folders Table
CREATE TABLE IF NOT EXISTS document_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_name VARCHAR(255) NOT NULL,
    folder_path TEXT NOT NULL UNIQUE,
    parent_folder_id UUID REFERENCES document_folders(id),
    project_id UUID,
    
    -- Folder properties
    description TEXT,
    folder_type VARCHAR(50),
    is_system_folder BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    
    -- Access control
    is_public BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(20) DEFAULT 'project',
    allowed_users JSONB DEFAULT '[]',
    allowed_roles JSONB DEFAULT '[]',
    
    -- Metadata
    document_count INTEGER DEFAULT 0,
    total_size INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for document_folders
CREATE INDEX IF NOT EXISTS document_folders_path_idx ON document_folders(folder_path);
CREATE INDEX IF NOT EXISTS document_folders_parent_idx ON document_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS document_folders_project_idx ON document_folders(project_id);
CREATE INDEX IF NOT EXISTS document_folders_type_idx ON document_folders(folder_type);
CREATE INDEX IF NOT EXISTS document_folders_access_idx ON document_folders(access_level);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(50) NOT NULL UNIQUE,
    
    -- Basic document information
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- File properties
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(10) NOT NULL,
    md5_hash VARCHAR(32) NOT NULL,
    sha256_hash VARCHAR(64),
    
    -- Storage information
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'local',
    storage_url TEXT,
    thumbnail_path TEXT,
    
    -- Organization
    folder_id UUID REFERENCES document_folders(id),
    project_id UUID,
    client_id UUID,
    
    -- Categorization
    document_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    subcategory VARCHAR(50),
    tags JSONB DEFAULT '[]',
    
    -- Status and lifecycle
    status VARCHAR(20) DEFAULT 'active',
    is_template BOOLEAN DEFAULT FALSE,
    template_category VARCHAR(50),
    
    -- Version control
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    is_latest_version BOOLEAN DEFAULT TRUE,
    version_notes TEXT,
    
    -- Access control and security
    is_public BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(20) DEFAULT 'project',
    allowed_users JSONB DEFAULT '[]',
    allowed_roles JSONB DEFAULT '[]',
    is_password_protected BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    
    -- Content analysis
    has_text BOOLEAN DEFAULT FALSE,
    extracted_text TEXT,
    ocr_text TEXT,
    page_count INTEGER,
    word_count INTEGER,
    
    -- Workflow and approval
    requires_approval BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) DEFAULT 'pending',
    approved_by UUID,
    approved_date TIMESTAMP,
    rejection_reason TEXT,
    
    -- Retention and expiry
    retention_period_days INTEGER,
    expiry_date DATE,
    auto_delete_date DATE,
    is_expired BOOLEAN DEFAULT FALSE,
    
    -- Analytics and usage
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_downloaded TIMESTAMP,
    last_viewed TIMESTAMP,
    
    -- Quality and compliance
    is_compliant BOOLEAN DEFAULT TRUE,
    compliance_notes TEXT,
    quality_score INTEGER,
    has_watermark BOOLEAN DEFAULT FALSE,
    
    -- Document-specific fields
    document_date DATE,
    author_name VARCHAR(255),
    company_name VARCHAR(255),
    contract_number VARCHAR(100),
    invoice_number VARCHAR(100),
    receipt_number VARCHAR(100),
    
    -- Financial documents
    amount DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    tax_amount DECIMAL(15, 2),
    
    -- Technical documents
    technical_specs JSONB DEFAULT '{}',
    equipment_ids JSONB DEFAULT '[]',
    location_data JSONB DEFAULT '{}',
    
    -- Photo/Image metadata
    image_width INTEGER,
    image_height INTEGER,
    camera_model VARCHAR(100),
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    date_taken TIMESTAMP,
    
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    uploaded_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for documents
CREATE INDEX IF NOT EXISTS documents_id_idx ON documents(document_id);
CREATE INDEX IF NOT EXISTS documents_file_name_idx ON documents(file_name);
CREATE INDEX IF NOT EXISTS documents_folder_idx ON documents(folder_id);
CREATE INDEX IF NOT EXISTS documents_project_idx ON documents(project_id);
CREATE INDEX IF NOT EXISTS documents_client_idx ON documents(client_id);
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(document_type);
CREATE INDEX IF NOT EXISTS documents_category_idx ON documents(category);
CREATE INDEX IF NOT EXISTS documents_status_idx ON documents(status);
CREATE INDEX IF NOT EXISTS documents_version_idx ON documents(parent_document_id, version);
CREATE INDEX IF NOT EXISTS documents_approval_idx ON documents(approval_status);
CREATE INDEX IF NOT EXISTS documents_date_idx ON documents(document_date);
CREATE INDEX IF NOT EXISTS documents_md5_idx ON documents(md5_hash);
CREATE INDEX IF NOT EXISTS documents_mime_type_idx ON documents(mime_type);
CREATE INDEX IF NOT EXISTS documents_tags_idx ON documents USING GIN (tags);

-- Document Access Logs Table
CREATE TABLE IF NOT EXISTS document_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    document_id UUID NOT NULL REFERENCES documents(id),
    user_id UUID NOT NULL,
    
    -- Access details
    access_type VARCHAR(20) NOT NULL,
    access_method VARCHAR(20),
    
    -- Session information
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Request details
    request_duration INTEGER,
    bytes_transferred INTEGER,
    was_successful BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Context
    referer_url TEXT,
    device_type VARCHAR(20),
    browser_name VARCHAR(50),
    browser_version VARCHAR(20),
    
    metadata JSONB DEFAULT '{}',
    accessed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for document_access_logs
CREATE INDEX IF NOT EXISTS document_access_logs_document_idx ON document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS document_access_logs_user_idx ON document_access_logs(user_id);
CREATE INDEX IF NOT EXISTS document_access_logs_type_idx ON document_access_logs(access_type);
CREATE INDEX IF NOT EXISTS document_access_logs_time_idx ON document_access_logs(accessed_at);
CREATE INDEX IF NOT EXISTS document_access_logs_ip_idx ON document_access_logs(ip_address);

-- Document Shares Table
CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id VARCHAR(50) NOT NULL UNIQUE,
    
    document_id UUID NOT NULL REFERENCES documents(id),
    shared_by UUID NOT NULL,
    
    -- Share configuration
    share_type VARCHAR(20) NOT NULL,
    share_url TEXT,
    access_token VARCHAR(255),
    
    -- Recipients
    shared_with_users JSONB DEFAULT '[]',
    shared_with_emails JSONB DEFAULT '[]',
    shared_with_roles JSONB DEFAULT '[]',
    
    -- Permissions
    can_view BOOLEAN DEFAULT TRUE,
    can_download BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_comment BOOLEAN DEFAULT FALSE,
    can_share BOOLEAN DEFAULT FALSE,
    
    -- Access control
    requires_password BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    requires_login BOOLEAN DEFAULT TRUE,
    
    -- Expiry and limits
    expiry_date TIMESTAMP,
    max_accesses INTEGER,
    access_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Analytics
    last_accessed TIMESTAMP,
    unique_accessors JSONB DEFAULT '[]',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for document_shares
CREATE INDEX IF NOT EXISTS document_shares_id_idx ON document_shares(share_id);
CREATE INDEX IF NOT EXISTS document_shares_document_idx ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS document_shares_shared_by_idx ON document_shares(shared_by);
CREATE INDEX IF NOT EXISTS document_shares_type_idx ON document_shares(share_type);
CREATE INDEX IF NOT EXISTS document_shares_expiry_idx ON document_shares(expiry_date);
CREATE INDEX IF NOT EXISTS document_shares_active_idx ON document_shares(is_active);

-- Document Comments Table
CREATE TABLE IF NOT EXISTS document_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    document_id UUID NOT NULL REFERENCES documents(id),
    user_id UUID NOT NULL,
    
    -- Comment content
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'general',
    
    -- Threading and replies
    parent_comment_id UUID REFERENCES document_comments(id),
    thread_id UUID,
    
    -- Page/location reference
    page_number INTEGER,
    x_position DECIMAL(8, 4),
    y_position DECIMAL(8, 4),
    
    -- Status and resolution
    status VARCHAR(20) DEFAULT 'open',
    resolved_by UUID,
    resolved_date TIMESTAMP,
    resolution TEXT,
    
    -- Attachments and references
    attachments JSONB DEFAULT '[]',
    mentions JSONB DEFAULT '[]',
    
    -- Metadata
    is_private BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for document_comments
CREATE INDEX IF NOT EXISTS document_comments_document_idx ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS document_comments_user_idx ON document_comments(user_id);
CREATE INDEX IF NOT EXISTS document_comments_parent_idx ON document_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS document_comments_thread_idx ON document_comments(thread_id);
CREATE INDEX IF NOT EXISTS document_comments_status_idx ON document_comments(status);
CREATE INDEX IF NOT EXISTS document_comments_created_idx ON document_comments(created_at);

-- Document Workflows Table
CREATE TABLE IF NOT EXISTS document_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(50) NOT NULL UNIQUE,
    
    document_id UUID NOT NULL REFERENCES documents(id),
    
    -- Workflow definition
    workflow_name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL,
    
    -- Current state
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Step configuration
    steps JSONB NOT NULL,
    step_history JSONB DEFAULT '[]',
    
    -- Assignment and routing
    current_assignees JSONB DEFAULT '[]',
    all_participants JSONB DEFAULT '[]',
    
    -- Timing
    due_date TIMESTAMP,
    started_date TIMESTAMP,
    completed_date TIMESTAMP,
    
    -- Configuration
    is_parallel BOOLEAN DEFAULT FALSE,
    requires_all_approvals BOOLEAN DEFAULT TRUE,
    allow_delegation BOOLEAN DEFAULT FALSE,
    
    -- Notifications
    notification_settings JSONB DEFAULT '{}',
    reminder_settings JSONB DEFAULT '{}',
    
    -- Results and outcome
    final_decision VARCHAR(20),
    outcome_notes TEXT,
    completion_percentage INTEGER DEFAULT 0,
    
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for document_workflows
CREATE INDEX IF NOT EXISTS document_workflows_id_idx ON document_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS document_workflows_document_idx ON document_workflows(document_id);
CREATE INDEX IF NOT EXISTS document_workflows_status_idx ON document_workflows(status);
CREATE INDEX IF NOT EXISTS document_workflows_step_idx ON document_workflows(current_step);
CREATE INDEX IF NOT EXISTS document_workflows_due_date_idx ON document_workflows(due_date);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Document management tables created successfully!';
END $$;