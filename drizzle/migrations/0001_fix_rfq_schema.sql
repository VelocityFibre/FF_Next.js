-- Migration: Fix RFQ Schema Mismatches
-- Date: 2025-08-25
-- Purpose: Add missing columns and create missing tables for RFQ functionality

-- 1. Update RFQs table with missing columns
ALTER TABLE rfqs 
ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS extended_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS issued_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS delivery_terms TEXT,
ADD COLUMN IF NOT EXISTS validity_period INTEGER,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ZAR',
ADD COLUMN IF NOT EXISTS technical_requirements TEXT,
ADD COLUMN IF NOT EXISTS responded_suppliers JSON,
ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_budget_estimate DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS lowest_quote_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS highest_quote_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS average_quote_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS awarded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS awarded_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS award_notes TEXT;

-- 2. Rename closing_date to response_deadline if exists
DO $$ 
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='rfqs' AND column_name='closing_date') THEN
        -- Copy data from closing_date to response_deadline if response_deadline is empty
        UPDATE rfqs SET response_deadline = closing_date WHERE response_deadline IS NULL;
        
        -- Drop closing_date after copying data
        ALTER TABLE rfqs DROP COLUMN IF EXISTS closing_date;
    END IF;
END $$;

-- 3. Create RFQ Items table if it doesn't exist
CREATE TABLE IF NOT EXISTS rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL,
    boq_item_id UUID,
    project_id VARCHAR(255) NOT NULL,
    line_number INTEGER NOT NULL,
    item_code VARCHAR(100),
    description TEXT NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(15,4) NOT NULL,
    uom VARCHAR(20) NOT NULL,
    budget_price DECIMAL(15,2),
    specifications JSON,
    technical_requirements TEXT,
    acceptable_alternatives JSON,
    evaluation_weight DECIMAL(5,2) DEFAULT 1.0,
    is_critical_item BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT rfq_items_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

-- 4. Create Supplier Invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS supplier_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL,
    supplier_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_email VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    invitation_status VARCHAR(20) DEFAULT 'sent',
    invited_at TIMESTAMP DEFAULT NOW(),
    viewed_at TIMESTAMP,
    responded_at TIMESTAMP,
    declined_at TIMESTAMP,
    access_token VARCHAR(500),
    token_expires_at TIMESTAMP,
    magic_link_token VARCHAR(500),
    last_login_at TIMESTAMP,
    invitation_message TEXT,
    decline_reason TEXT,
    reminders_sent INTEGER DEFAULT 0,
    last_reminder_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT supplier_invitations_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

-- 5. Create Quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL,
    supplier_id VARCHAR(255) NOT NULL,
    supplier_invitation_id UUID,
    project_id VARCHAR(255) NOT NULL,
    quote_number VARCHAR(100),
    quote_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft',
    submission_date TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    discount_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    lead_time INTEGER,
    payment_terms TEXT,
    delivery_terms TEXT,
    warranty_terms TEXT,
    validity_period INTEGER,
    notes TEXT,
    terms TEXT,
    conditions TEXT,
    evaluation_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    commercial_score DECIMAL(5,2),
    evaluation_notes TEXT,
    is_winner BOOLEAN DEFAULT false,
    awarded_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT quotes_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
    CONSTRAINT quotes_supplier_invitation_id_fkey FOREIGN KEY (supplier_invitation_id) REFERENCES supplier_invitations(id)
);

-- 6. Create Quote Items table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL,
    rfq_item_id UUID NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    line_number INTEGER NOT NULL,
    item_code VARCHAR(100),
    description TEXT NOT NULL,
    quoted_quantity DECIMAL(15,4),
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(15,2),
    alternate_offered BOOLEAN DEFAULT false,
    alternate_description TEXT,
    alternate_part_number VARCHAR(100),
    alternate_unit_price DECIMAL(15,2),
    lead_time INTEGER,
    minimum_order_quantity DECIMAL(15,4),
    packaging_unit VARCHAR(50),
    manufacturer_name VARCHAR(255),
    part_number VARCHAR(100),
    model_number VARCHAR(100),
    technical_notes TEXT,
    compliance_certificates JSON,
    technical_compliance BOOLEAN DEFAULT true,
    commercial_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    CONSTRAINT quote_items_rfq_item_id_fkey FOREIGN KEY (rfq_item_id) REFERENCES rfq_items(id) ON DELETE CASCADE
);

-- 7. Create Quote Documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT,
    storage_provider VARCHAR(50) DEFAULT 'firebase',
    uploaded_by VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT quote_documents_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rfq_project_id ON rfqs(project_id);
CREATE INDEX IF NOT EXISTS idx_rfq_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfq_response_deadline ON rfqs(response_deadline);

CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_project_id ON rfq_items(project_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_boq_item_id ON rfq_items(boq_item_id);

CREATE INDEX IF NOT EXISTS idx_supplier_invitations_rfq_id ON supplier_invitations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invitations_supplier_id ON supplier_invitations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invitations_status ON supplier_invitations(invitation_status);

CREATE INDEX IF NOT EXISTS idx_quotes_rfq_id ON quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier_id ON quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_is_winner ON quotes(is_winner);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_rfq_item_id ON quote_items(rfq_item_id);

CREATE INDEX IF NOT EXISTS idx_quote_documents_quote_id ON quote_documents(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_documents_type ON quote_documents(document_type);

-- 9. Update RFQs table metadata
COMMENT ON TABLE rfqs IS 'Request for Quote management - stores RFQ requests';
COMMENT ON TABLE rfq_items IS 'Items within an RFQ request';
COMMENT ON TABLE supplier_invitations IS 'Supplier invitations for RFQs';
COMMENT ON TABLE quotes IS 'Supplier quote responses to RFQs';
COMMENT ON TABLE quote_items IS 'Line items within supplier quotes';
COMMENT ON TABLE quote_documents IS 'Documents attached to quotes';

-- 10. Grant permissions (if needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rfqs TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rfq_items TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_invitations TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON quotes TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON quote_items TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON quote_documents TO your_app_user;