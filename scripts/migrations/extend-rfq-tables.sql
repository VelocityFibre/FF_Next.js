-- Extended RFQ/BOQ Tables Migration
-- This migration adds additional tables for RFQ responses, notifications, and BOQ items
-- Date: 2025-09-10

-- ============================================
-- RFQ Extensions
-- ============================================

-- Update existing RFQ table to add missing columns
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS invited_suppliers JSON DEFAULT '[]';
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS total_budget_estimate DECIMAL(15, 2);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ZAR';
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS validity_period INTEGER DEFAULT 30;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS delivery_terms TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS technical_requirements TEXT;

-- RFQ Items table for detailed line items
CREATE TABLE IF NOT EXISTS rfq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  item_code VARCHAR(100),
  description TEXT NOT NULL,
  specifications TEXT,
  quantity DECIMAL(15, 4) NOT NULL,
  uom VARCHAR(50), -- Unit of Measure
  estimated_unit_price DECIMAL(15, 2),
  estimated_total_price DECIMAL(15, 2),
  category VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rfq_id, line_number)
);

-- RFQ Responses table for supplier quotes
CREATE TABLE IF NOT EXISTS rfq_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name VARCHAR(255) NOT NULL,
  response_number VARCHAR(100) UNIQUE,
  submission_date TIMESTAMP NOT NULL DEFAULT NOW(),
  total_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  validity_period INTEGER DEFAULT 30,
  payment_terms VARCHAR(100),
  delivery_terms TEXT,
  delivery_date TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted', -- submitted, under_review, accepted, rejected, withdrawn
  technical_compliance BOOLEAN,
  commercial_compliance BOOLEAN,
  evaluation_score DECIMAL(5, 2),
  evaluation_notes TEXT,
  attachments JSON,
  evaluated_by VARCHAR(255),
  evaluated_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RFQ Response Items for line-by-line quotes
CREATE TABLE IF NOT EXISTS rfq_response_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES rfq_responses(id) ON DELETE CASCADE,
  rfq_item_id UUID NOT NULL REFERENCES rfq_items(id),
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  delivery_days INTEGER,
  compliance_status VARCHAR(20) DEFAULT 'compliant', -- compliant, partial, non_compliant
  alternative_offered BOOLEAN DEFAULT false,
  alternative_description TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RFQ Notifications table
CREATE TABLE IF NOT EXISTS rfq_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- invitation, reminder, deadline, evaluation, award
  recipient_type VARCHAR(20) NOT NULL, -- supplier, internal, all
  recipient_id VARCHAR(255),
  recipient_email VARCHAR(255),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, cancelled
  sent_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RFQ Evaluation Criteria table
CREATE TABLE IF NOT EXISTS rfq_evaluation_criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  criteria_name VARCHAR(100) NOT NULL,
  criteria_type VARCHAR(50) NOT NULL, -- price, technical, delivery, quality, service
  weight DECIMAL(5, 2) NOT NULL,
  description TEXT,
  scoring_method VARCHAR(50), -- lowest_price, highest_score, weighted_average
  max_score DECIMAL(5, 2) DEFAULT 100,
  mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RFQ Evaluation Scores table
CREATE TABLE IF NOT EXISTS rfq_evaluation_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES rfq_responses(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES rfq_evaluation_criteria(id),
  score DECIMAL(5, 2) NOT NULL,
  weighted_score DECIMAL(5, 2),
  comments TEXT,
  evaluated_by VARCHAR(255),
  evaluated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(response_id, criteria_id)
);

-- ============================================
-- BOQ Extensions
-- ============================================

-- Update existing BOQ table if needed
ALTER TABLE boqs ADD COLUMN IF NOT EXISTS approval_workflow JSON;
ALTER TABLE boqs ADD COLUMN IF NOT EXISTS import_source VARCHAR(50);
ALTER TABLE boqs ADD COLUMN IF NOT EXISTS import_file_name VARCHAR(255);
ALTER TABLE boqs ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE boqs ADD COLUMN IF NOT EXISTS validation_errors JSON;

-- Extended BOQ Items table (enhancing existing)
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255);
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS lead_time_days INTEGER;
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS min_order_quantity DECIMAL(15, 4);
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS work_package VARCHAR(100);
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;
ALTER TABLE boq_items ADD COLUMN IF NOT EXISTS procurement_status VARCHAR(50) DEFAULT 'not_started';

-- BOQ Revisions table for version control
CREATE TABLE IF NOT EXISTS boq_revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boq_id UUID NOT NULL REFERENCES boqs(id),
  revision_number INTEGER NOT NULL,
  revision_date TIMESTAMP NOT NULL DEFAULT NOW(),
  revised_by VARCHAR(255) NOT NULL,
  revision_reason TEXT,
  changes_summary JSON,
  previous_revision_id UUID REFERENCES boq_revisions(id),
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(boq_id, revision_number)
);

-- BOQ Approval History
CREATE TABLE IF NOT EXISTS boq_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boq_id UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
  approval_level INTEGER NOT NULL,
  approver_id VARCHAR(255) NOT NULL,
  approver_name VARCHAR(255),
  approval_status VARCHAR(20) NOT NULL, -- pending, approved, rejected, recalled
  approval_date TIMESTAMP,
  comments TEXT,
  conditions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- BOQ to RFQ linking table
CREATE TABLE IF NOT EXISTS boq_rfq_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boq_id UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  link_type VARCHAR(50) NOT NULL, -- full, partial, reference
  linked_items_count INTEGER DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(boq_id, rfq_id)
);

-- BOQ Item to RFQ Item mapping
CREATE TABLE IF NOT EXISTS boq_rfq_item_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boq_item_id UUID NOT NULL REFERENCES boq_items(id) ON DELETE CASCADE,
  rfq_item_id UUID NOT NULL REFERENCES rfq_items(id) ON DELETE CASCADE,
  quantity_ratio DECIMAL(10, 4) DEFAULT 1, -- For partial quantities
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(boq_item_id, rfq_item_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- RFQ Indexes
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_rfq_id ON rfq_responses(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_supplier_id ON rfq_responses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_status ON rfq_responses(status);
CREATE INDEX IF NOT EXISTS idx_rfq_response_items_response_id ON rfq_response_items(response_id);
CREATE INDEX IF NOT EXISTS idx_rfq_notifications_rfq_id ON rfq_notifications(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_notifications_status ON rfq_notifications(status);
CREATE INDEX IF NOT EXISTS idx_rfq_evaluation_scores_response_id ON rfq_evaluation_scores(response_id);

-- BOQ Indexes
CREATE INDEX IF NOT EXISTS idx_boq_items_boq_id ON boq_items(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_items_project_id ON boq_items(project_id);
CREATE INDEX IF NOT EXISTS idx_boq_items_supplier_id ON boq_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_boq_revisions_boq_id ON boq_revisions(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_approvals_boq_id ON boq_approvals(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_rfq_links_boq_id ON boq_rfq_links(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_rfq_links_rfq_id ON boq_rfq_links(rfq_id);

-- ============================================
-- Views for Common Queries
-- ============================================

-- RFQ Summary View
CREATE OR REPLACE VIEW rfq_summary AS
SELECT 
  r.id,
  r.rfq_number,
  r.project_id,
  r.title,
  r.status,
  r.issue_date,
  r.response_deadline,
  r.invited_suppliers,
  COUNT(DISTINCT ri.id) as item_count,
  COUNT(DISTINCT rr.id) as response_count,
  MIN(rr.total_amount) as lowest_bid,
  MAX(rr.total_amount) as highest_bid,
  AVG(rr.total_amount) as average_bid
FROM rfqs r
LEFT JOIN rfq_items ri ON r.id = ri.rfq_id
LEFT JOIN rfq_responses rr ON r.id = rr.rfq_id AND rr.status != 'withdrawn'
GROUP BY r.id;

-- BOQ Summary View
CREATE OR REPLACE VIEW boq_summary AS
SELECT 
  b.id,
  b.project_id,
  b.name,
  b.status,
  b.version,
  b.item_count,
  b.total_estimated_value,
  COUNT(DISTINCT bi.id) as actual_item_count,
  SUM(bi.amount) as calculated_total,
  COUNT(DISTINCT brl.rfq_id) as linked_rfqs
FROM boqs b
LEFT JOIN boq_items bi ON b.id = bi.boq_id
LEFT JOIN boq_rfq_links brl ON b.id = brl.boq_id
GROUP BY b.id;

-- ============================================
-- Functions
-- ============================================

-- Function to calculate RFQ response statistics
CREATE OR REPLACE FUNCTION calculate_rfq_stats(p_rfq_id UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_responses', COUNT(DISTINCT id),
    'evaluated_responses', COUNT(DISTINCT CASE WHEN status = 'under_review' OR status = 'accepted' THEN id END),
    'average_amount', AVG(total_amount),
    'lowest_amount', MIN(total_amount),
    'highest_amount', MAX(total_amount),
    'compliance_rate', AVG(CASE WHEN technical_compliance AND commercial_compliance THEN 1 ELSE 0 END) * 100
  ) INTO stats
  FROM rfq_responses
  WHERE rfq_id = p_rfq_id AND status != 'withdrawn';
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Migration completion
-- ============================================

-- Update migration tracking
INSERT INTO migrations (name, executed_at) 
VALUES ('extend-rfq-tables', NOW())
ON CONFLICT DO NOTHING;