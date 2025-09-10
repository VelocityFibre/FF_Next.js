-- Suppliers Management Tables
-- For managing supplier information, ratings, compliance, and products

-- Main suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    trading_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_number VARCHAR(100),
    
    -- Status and type
    status VARCHAR(50) DEFAULT 'pending', -- active, inactive, pending, suspended, blacklisted, archived
    business_type VARCHAR(50) DEFAULT 'other', -- manufacturer, distributor, wholesaler, retailer, service_provider, contractor, consultant, other
    is_active BOOLEAN DEFAULT true,
    is_preferred BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    -- Contact information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    fax VARCHAR(50),
    website VARCHAR(255),
    
    -- Primary contact
    contact_name VARCHAR(255),
    contact_title VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_mobile VARCHAR(50),
    contact_department VARCHAR(100),
    
    -- Address information
    physical_street1 VARCHAR(255),
    physical_street2 VARCHAR(255),
    physical_city VARCHAR(100),
    physical_state VARCHAR(100),
    physical_postal_code VARCHAR(20),
    physical_country VARCHAR(100) DEFAULT 'South Africa',
    physical_lat DECIMAL(10, 8),
    physical_lng DECIMAL(11, 8),
    
    postal_street1 VARCHAR(255),
    postal_street2 VARCHAR(255),
    postal_city VARCHAR(100),
    postal_state VARCHAR(100),
    postal_postal_code VARCHAR(20),
    postal_country VARCHAR(100),
    
    billing_street1 VARCHAR(255),
    billing_street2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    
    -- Banking information
    bank_name VARCHAR(100),
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_branch_code VARCHAR(20),
    bank_swift_code VARCHAR(20),
    bank_iban VARCHAR(50),
    
    -- Business information
    employee_size VARCHAR(20), -- 1-10, 11-50, 51-250, 251-1000, 1000+
    annual_revenue VARCHAR(20), -- under_1m, 1m_5m, 5m_10m, 10m_50m, 50m_100m, over_100m
    established_date DATE,
    industry VARCHAR(100),
    province VARCHAR(100),
    
    -- Payment and order terms
    preferred_payment_terms VARCHAR(50), -- net30, net60, net90, immediate, custom
    currency VARCHAR(3) DEFAULT 'ZAR',
    credit_limit DECIMAL(15, 2),
    lead_time_days INTEGER,
    minimum_order_value DECIMAL(15, 2),
    
    -- Rating
    rating_overall DECIMAL(3, 2) DEFAULT 0, -- 0-5 scale
    rating_quality DECIMAL(3, 2) DEFAULT 0,
    rating_delivery DECIMAL(3, 2) DEFAULT 0,
    rating_pricing DECIMAL(3, 2) DEFAULT 0,
    rating_communication DECIMAL(3, 2) DEFAULT 0,
    rating_flexibility DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    last_review_date TIMESTAMP,
    last_reviewed_by VARCHAR(255),
    
    -- Compliance status
    tax_compliant BOOLEAN DEFAULT false,
    bee_compliant BOOLEAN DEFAULT false,
    bee_level INTEGER,
    insurance_valid BOOLEAN DEFAULT false,
    documents_verified BOOLEAN DEFAULT false,
    last_audit_date DATE,
    next_audit_date DATE,
    
    -- Blacklist information
    blacklisted BOOLEAN DEFAULT false,
    blacklist_reason TEXT,
    blacklisted_at TIMESTAMP,
    blacklisted_by VARCHAR(255),
    
    -- Inactive information
    inactive_reason TEXT,
    inactivated_at TIMESTAMP,
    
    -- Preference information
    preferred_since TIMESTAMP,
    preferred_by VARCHAR(255),
    
    -- Additional fields
    notes TEXT,
    tags TEXT[], -- Array of tags
    categories TEXT[], -- Array of product categories
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_contacted_at TIMESTAMP,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(trading_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(email, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(notes, '')), 'C')
    ) STORED
);

-- Supplier ratings table (individual reviews)
CREATE TABLE IF NOT EXISTS supplier_ratings (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Rating scores (0-5 scale)
    overall_rating DECIMAL(3, 2) NOT NULL,
    quality_rating DECIMAL(3, 2),
    delivery_rating DECIMAL(3, 2),
    pricing_rating DECIMAL(3, 2),
    communication_rating DECIMAL(3, 2),
    flexibility_rating DECIMAL(3, 2),
    
    -- Review details
    review_title VARCHAR(255),
    review_text TEXT,
    order_reference VARCHAR(100),
    
    -- Response
    supplier_response TEXT,
    response_date TIMESTAMP,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false
);

-- Supplier compliance documents table
CREATE TABLE IF NOT EXISTS supplier_compliance (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Document information
    doc_type VARCHAR(50) NOT NULL, -- tax_clearance, bee_certificate, company_registration, bank_confirmation, insurance, contract, nda, quality_cert, price_list, catalog, other
    doc_name VARCHAR(255) NOT NULL,
    doc_number VARCHAR(100),
    doc_url TEXT,
    
    -- Status and validity
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, expired
    verification_status VARCHAR(50) DEFAULT 'pending', -- verified, pending, rejected
    issue_date DATE,
    expiry_date DATE,
    
    -- Issuing information
    issuing_body VARCHAR(255),
    
    -- Verification
    verified_by VARCHAR(255),
    verified_at TIMESTAMP,
    verification_notes TEXT,
    rejection_reason TEXT,
    
    -- File information
    file_size INTEGER,
    file_type VARCHAR(50),
    
    -- Metadata
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Supplier products/services table
CREATE TABLE IF NOT EXISTS supplier_products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Product information
    product_code VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Pricing
    unit_price DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    unit_of_measure VARCHAR(50),
    min_order_quantity DECIMAL(10, 2),
    bulk_pricing JSONB, -- JSON structure for quantity-based pricing tiers
    
    -- Availability
    in_stock BOOLEAN DEFAULT true,
    stock_quantity DECIMAL(10, 2),
    lead_time_days INTEGER,
    
    -- Additional details
    brand VARCHAR(100),
    manufacturer VARCHAR(255),
    model_number VARCHAR(100),
    specifications JSONB, -- JSON structure for technical specifications
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    discontinued BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_price_update TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(supplier_id, product_code)
);

-- Supplier contacts table (additional contacts)
CREATE TABLE IF NOT EXISTS supplier_contacts (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Contact type
    contact_type VARCHAR(50) NOT NULL, -- sales, accounts, technical, emergency, other
    
    -- Contact information
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    department VARCHAR(100),
    
    -- Preferences
    is_primary BOOLEAN DEFAULT false,
    preferred_contact_method VARCHAR(20), -- email, phone, mobile
    
    -- Availability
    available_hours VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Supplier contracts table
CREATE TABLE IF NOT EXISTS supplier_contracts (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Contract details
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    contract_type VARCHAR(50), -- supply, service, framework, nda, other
    title VARCHAR(255),
    description TEXT,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE,
    signed_date DATE,
    
    -- Value
    total_value DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    payment_terms VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, expired, terminated, renewed
    auto_renew BOOLEAN DEFAULT false,
    renewal_notice_days INTEGER,
    
    -- Documents
    document_url TEXT,
    
    -- SLA
    sla_response_time_hours INTEGER,
    sla_resolution_time_hours INTEGER,
    sla_uptime_percentage DECIMAL(5, 2),
    sla_penalties TEXT,
    
    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    terminated_by VARCHAR(255),
    terminated_at TIMESTAMP,
    termination_reason TEXT
);

-- Supplier performance history table
CREATE TABLE IF NOT EXISTS supplier_performance_history (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(20), -- monthly, quarterly, yearly
    
    -- Metrics
    orders_completed INTEGER DEFAULT 0,
    orders_cancelled INTEGER DEFAULT 0,
    on_time_delivery_rate DECIMAL(5, 2),
    quality_issue_rate DECIMAL(5, 2),
    return_rate DECIMAL(5, 2),
    
    -- Financial
    total_spend DECIMAL(15, 2),
    average_order_value DECIMAL(15, 2),
    
    -- Issues
    quality_issues INTEGER DEFAULT 0,
    delivery_issues INTEGER DEFAULT 0,
    pricing_issues INTEGER DEFAULT 0,
    communication_issues INTEGER DEFAULT 0,
    
    -- Resolution
    average_resolution_time_hours DECIMAL(10, 2),
    unresolved_issues INTEGER DEFAULT 0,
    
    -- Calculated scores
    overall_score DECIMAL(5, 2),
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT NOW(),
    calculated_by VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_is_preferred ON suppliers(is_preferred);
CREATE INDEX idx_suppliers_categories ON suppliers USING GIN(categories);
CREATE INDEX idx_suppliers_tags ON suppliers USING GIN(tags);
CREATE INDEX idx_suppliers_search ON suppliers USING GIN(search_vector);
CREATE INDEX idx_suppliers_created_at ON suppliers(created_at DESC);

CREATE INDEX idx_supplier_ratings_supplier_id ON supplier_ratings(supplier_id);
CREATE INDEX idx_supplier_ratings_created_at ON supplier_ratings(created_at DESC);

CREATE INDEX idx_supplier_compliance_supplier_id ON supplier_compliance(supplier_id);
CREATE INDEX idx_supplier_compliance_doc_type ON supplier_compliance(doc_type);
CREATE INDEX idx_supplier_compliance_expiry_date ON supplier_compliance(expiry_date);
CREATE INDEX idx_supplier_compliance_status ON supplier_compliance(status);

CREATE INDEX idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_category ON supplier_products(category);
CREATE INDEX idx_supplier_products_is_active ON supplier_products(is_active);

CREATE INDEX idx_supplier_contracts_supplier_id ON supplier_contracts(supplier_id);
CREATE INDEX idx_supplier_contracts_status ON supplier_contracts(status);
CREATE INDEX idx_supplier_contracts_end_date ON supplier_contracts(end_date);

CREATE INDEX idx_supplier_performance_supplier_id ON supplier_performance_history(supplier_id);
CREATE INDEX idx_supplier_performance_period ON supplier_performance_history(period_start, period_end);

-- Add triggers for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_ratings_updated_at BEFORE UPDATE ON supplier_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_compliance_updated_at BEFORE UPDATE ON supplier_compliance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_products_updated_at BEFORE UPDATE ON supplier_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_contracts_updated_at BEFORE UPDATE ON supplier_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();