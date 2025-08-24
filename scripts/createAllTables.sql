-- Complete Database Schema for FibreFlow React
-- All tables required by the application based on service dependencies scan

-- ============================================
-- ANALYTICAL TABLES (Core Analytics)
-- ============================================

-- Used by: analyticsService.ts, firebaseToNeonSync.ts
CREATE TABLE IF NOT EXISTS project_analytics (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  project_name TEXT NOT NULL,
  client_id VARCHAR(255),
  client_name TEXT,
  total_poles INTEGER DEFAULT 0,
  completed_poles INTEGER DEFAULT 0,
  total_drops INTEGER DEFAULT 0,
  completed_drops INTEGER DEFAULT 0,
  total_budget DECIMAL(15, 2),
  spent_budget DECIMAL(15, 2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  actual_end_date TIMESTAMP,
  completion_percentage DECIMAL(5, 2),
  on_time_delivery BOOLEAN,
  quality_score DECIMAL(5, 2),
  last_synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: analyticsService.ts
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255),
  metric_type VARCHAR(100) NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15, 4) NOT NULL,
  unit VARCHAR(50),
  team_id VARCHAR(255),
  contractor_id VARCHAR(255),
  recorded_date TIMESTAMP NOT NULL,
  week_number INTEGER,
  month_number INTEGER,
  year INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Used by: analyticsService.ts
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type VARCHAR(50) NOT NULL,
  project_id VARCHAR(255),
  client_id VARCHAR(255),
  supplier_id VARCHAR(255),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  status VARCHAR(50) NOT NULL,
  invoice_number VARCHAR(100),
  po_number VARCHAR(100),
  transaction_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP,
  paid_date TIMESTAMP,
  notes TEXT,
  attachments JSON,
  created_by VARCHAR(255),
  approved_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: analyticsService.ts
CREATE TABLE IF NOT EXISTS material_usage (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  material_id VARCHAR(255) NOT NULL,
  material_name TEXT NOT NULL,
  category VARCHAR(100),
  planned_quantity DECIMAL(15, 4),
  used_quantity DECIMAL(15, 4) NOT NULL,
  wasted_quantity DECIMAL(15, 4),
  unit VARCHAR(50),
  unit_cost DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  pole_number VARCHAR(100),
  section_id VARCHAR(255),
  usage_date TIMESTAMP NOT NULL,
  recorded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Used by: analyticsService.ts
CREATE TABLE IF NOT EXISTS staff_performance (
  id SERIAL PRIMARY KEY,
  staff_id VARCHAR(255) NOT NULL,
  staff_name TEXT NOT NULL,
  role VARCHAR(100),
  tasks_completed INTEGER DEFAULT 0,
  hours_worked DECIMAL(10, 2),
  productivity_score DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),
  attendance_rate DECIMAL(5, 2),
  project_id VARCHAR(255),
  team_id VARCHAR(255),
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  period_type VARCHAR(50),
  overtime_hours DECIMAL(10, 2),
  incident_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Used by: analyticsService.ts
CREATE TABLE IF NOT EXISTS report_cache (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(100) NOT NULL,
  report_name TEXT NOT NULL,
  filters JSON,
  project_id VARCHAR(255),
  date_from TIMESTAMP,
  date_to TIMESTAMP,
  report_data JSON NOT NULL,
  chart_data JSON,
  summary JSON,
  generated_by VARCHAR(255),
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  generation_time_ms INTEGER,
  data_size_bytes INTEGER
);

-- Used by: auditLogger.ts
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_name TEXT,
  user_role VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  old_value JSON,
  new_value JSON,
  changes_summary TEXT,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  session_id VARCHAR(255),
  source VARCHAR(50)
);

-- Used by: analyticsService.ts, firebaseToNeonSync.ts
CREATE TABLE IF NOT EXISTS client_analytics (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2),
  outstanding_balance DECIMAL(15, 2),
  average_project_value DECIMAL(15, 2),
  payment_score DECIMAL(5, 2),
  average_project_duration INTEGER,
  on_time_completion_rate DECIMAL(5, 2),
  satisfaction_score DECIMAL(5, 2),
  last_project_date TIMESTAMP,
  next_follow_up_date TIMESTAMP,
  total_interactions INTEGER DEFAULT 0,
  client_category VARCHAR(50),
  lifetime_value DECIMAL(15, 2),
  last_calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CONTRACTOR MANAGEMENT TABLES
-- ============================================

-- Used by: contractorCrudService.ts, ragScoringService.ts, contractorOnboardingService.ts, insuranceService.ts
CREATE TABLE IF NOT EXISTS contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  contact_person TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  physical_address TEXT,
  postal_address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  business_type VARCHAR(50),
  industry_category VARCHAR(100),
  years_in_business INTEGER,
  employee_count INTEGER,
  annual_turnover DECIMAL(15, 2),
  credit_rating VARCHAR(10),
  payment_terms VARCHAR(50),
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  branch_code VARCHAR(10),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  compliance_status VARCHAR(20) DEFAULT 'pending',
  rag_overall VARCHAR(10) DEFAULT 'amber',
  rag_financial VARCHAR(10) DEFAULT 'amber',
  rag_compliance VARCHAR(10) DEFAULT 'amber',
  rag_performance VARCHAR(10) DEFAULT 'amber',
  rag_safety VARCHAR(10) DEFAULT 'amber',
  performance_score DECIMAL(5, 2),
  safety_score DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),
  timeliness_score DECIMAL(5, 2),
  total_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  cancelled_projects INTEGER DEFAULT 0,
  onboarding_progress INTEGER DEFAULT 0,
  onboarding_completed_at TIMESTAMP,
  documents_expiring INTEGER DEFAULT 0,
  notes TEXT,
  tags JSON,
  last_activity TIMESTAMP,
  next_review_date TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: contractorTeamService.ts, ragScoringService.ts
CREATE TABLE IF NOT EXISTS contractor_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_type VARCHAR(50),
  specialization VARCHAR(100),
  max_capacity INTEGER NOT NULL,
  current_capacity INTEGER DEFAULT 0,
  available_capacity INTEGER DEFAULT 0,
  efficiency DECIMAL(5, 2),
  quality_rating DECIMAL(5, 2),
  safety_record DECIMAL(5, 2),
  is_active BOOLEAN DEFAULT true,
  availability VARCHAR(20) DEFAULT 'available',
  base_location TEXT,
  operating_radius INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: contractorTeamService.ts
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES contractor_teams(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  skill_level VARCHAR(20),
  certifications JSON,
  special_skills JSON,
  employment_type VARCHAR(20),
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  is_team_lead BOOLEAN DEFAULT false,
  performance_rating DECIMAL(5, 2),
  safety_score DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: ragScoringService.ts
CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  team_id UUID REFERENCES contractor_teams(id),
  assignment_type VARCHAR(50),
  scope TEXT NOT NULL,
  responsibilities JSON,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  actual_start_date TIMESTAMP,
  actual_end_date TIMESTAMP,
  contract_value DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  outstanding_amount DECIMAL(15, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'assigned',
  progress_percentage INTEGER DEFAULT 0,
  performance_rating DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),
  timeliness_score DECIMAL(5, 2),
  assignment_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: contractorDocumentService.ts, contractorOnboardingService.ts, insuranceService.ts
CREATE TABLE IF NOT EXISTS contractor_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_name TEXT NOT NULL,
  document_number VARCHAR(100),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  issue_date TIMESTAMP,
  expiry_date TIMESTAMP,
  is_expired BOOLEAN DEFAULT false,
  days_until_expiry INTEGER,
  verification_status VARCHAR(20) DEFAULT 'pending',
  verified_by VARCHAR(255),
  verified_at TIMESTAMP,
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PROCUREMENT PORTAL TABLES
-- ============================================

-- Used by: boqApiService.ts
CREATE TABLE IF NOT EXISTS boqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  title TEXT,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  mapping_status VARCHAR(20) DEFAULT 'pending',
  mapping_confidence DECIMAL(5, 2),
  uploaded_by VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
  file_name TEXT,
  file_url TEXT,
  file_size INTEGER,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  rejected_by VARCHAR(255),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  item_count INTEGER DEFAULT 0,
  mapped_items INTEGER DEFAULT 0,
  unmapped_items INTEGER DEFAULT 0,
  exceptions_count INTEGER DEFAULT 0,
  total_estimated_value DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'ZAR',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, version)
);

-- Used by: boqApiService.ts
CREATE TABLE IF NOT EXISTS boq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boq_id UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
  project_id VARCHAR(255) NOT NULL,
  item_number VARCHAR(50),
  description TEXT NOT NULL,
  unit VARCHAR(50),
  quantity DECIMAL(15, 4),
  rate DECIMAL(15, 2),
  amount DECIMAL(15, 2),
  category VARCHAR(100),
  material_code VARCHAR(100),
  mapped_material_id VARCHAR(255),
  mapping_confidence DECIMAL(5, 2),
  is_mapped BOOLEAN DEFAULT false,
  mapping_notes TEXT,
  parent_item_id UUID,
  level INTEGER DEFAULT 0,
  sequence_number INTEGER,
  custom_fields JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: boqApiService.ts
CREATE TABLE IF NOT EXISTS boq_exceptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boq_id UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
  boq_item_id UUID REFERENCES boq_items(id),
  exception_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  resolution_status VARCHAR(20) DEFAULT 'pending',
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: procurementApiService.ts
CREATE TABLE IF NOT EXISTS purchase_requisitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pr_number VARCHAR(100) NOT NULL UNIQUE,
  project_id VARCHAR(255) NOT NULL,
  boq_id UUID REFERENCES boqs(id),
  department VARCHAR(100),
  requested_by VARCHAR(255) NOT NULL,
  requested_date TIMESTAMP NOT NULL,
  required_date TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'medium',
  total_amount DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'ZAR',
  justification TEXT,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  rejected_by VARCHAR(255),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  notes TEXT,
  attachments JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: procurementApiService.ts
CREATE TABLE IF NOT EXISTS requisition_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pr_id UUID NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
  boq_item_id UUID REFERENCES boq_items(id),
  item_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  specifications TEXT,
  material_code VARCHAR(100),
  unit VARCHAR(50),
  quantity DECIMAL(15, 4) NOT NULL,
  estimated_price DECIMAL(15, 2),
  total_price DECIMAL(15, 2),
  supplier_id VARCHAR(255),
  supplier_name TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: procurementApiService.ts
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number VARCHAR(100) NOT NULL UNIQUE,
  pr_id UUID REFERENCES purchase_requisitions(id),
  supplier_id VARCHAR(255) NOT NULL,
  supplier_name TEXT NOT NULL,
  project_id VARCHAR(255) NOT NULL,
  order_date TIMESTAMP NOT NULL,
  delivery_date TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  payment_terms VARCHAR(100),
  delivery_terms VARCHAR(100),
  delivery_address TEXT,
  billing_address TEXT,
  subtotal DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2),
  discount_amount DECIMAL(15, 2),
  total_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  notes TEXT,
  terms_conditions TEXT,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: procurementApiService.ts
CREATE TABLE IF NOT EXISTS po_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  pr_item_id UUID REFERENCES requisition_items(id),
  line_number INTEGER NOT NULL,
  material_code VARCHAR(100),
  description TEXT NOT NULL,
  specifications TEXT,
  unit VARCHAR(50),
  quantity DECIMAL(15, 4) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  discount_percent DECIMAL(5, 2),
  tax_percent DECIMAL(5, 2),
  total_price DECIMAL(15, 2) NOT NULL,
  delivery_date TIMESTAMP,
  received_quantity DECIMAL(15, 4) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: procurementApiService.ts
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_number VARCHAR(100) NOT NULL UNIQUE,
  project_id VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  issue_date TIMESTAMP NOT NULL,
  closing_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  evaluation_criteria JSON,
  terms_conditions TEXT,
  delivery_requirements TEXT,
  payment_terms VARCHAR(100),
  total_items INTEGER DEFAULT 0,
  invited_suppliers INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used by: procurementApiService.ts
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_code VARCHAR(100) NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  registration_number VARCHAR(50),
  contact_person TEXT,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'South Africa',
  tax_number VARCHAR(50),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(15, 2),
  rating DECIMAL(3, 2),
  status VARCHAR(20) DEFAULT 'active',
  categories JSON,
  certifications JSON,
  preferred BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_project_analytics_project_id ON project_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_client_id ON project_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_project_metric ON kpi_metrics(project_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_date ON kpi_metrics(recorded_date);
CREATE INDEX IF NOT EXISTS idx_financial_project ON financial_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_client ON financial_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_financial_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_contractor_reg_number ON contractors(registration_number);
CREATE INDEX IF NOT EXISTS idx_contractor_status ON contractors(status);
CREATE INDEX IF NOT EXISTS idx_contractor_rag ON contractors(rag_overall);
CREATE INDEX IF NOT EXISTS idx_contractor_email ON contractors(email);
CREATE INDEX IF NOT EXISTS idx_contractor_team ON contractor_teams(contractor_id);
CREATE INDEX IF NOT EXISTS idx_team_type ON contractor_teams(team_type);
CREATE INDEX IF NOT EXISTS idx_team_member ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_contractor_member ON team_members(contractor_id);
CREATE INDEX IF NOT EXISTS idx_project_contractor ON project_assignments(project_id, contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_assignment ON project_assignments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_assignment_status ON project_assignments(status);
CREATE INDEX IF NOT EXISTS idx_contractor_doc ON contractor_documents(contractor_id);
CREATE INDEX IF NOT EXISTS idx_doc_type ON contractor_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_doc_expiry ON contractor_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_boq_project ON boqs(project_id);
CREATE INDEX IF NOT EXISTS idx_boq_status ON boqs(status);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_project ON purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);

-- ============================================
-- GRANT PERMISSIONS (adjust as needed)
-- ============================================
-- Uncomment and adjust based on your database user setup
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;