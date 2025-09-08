// Database Types - Pure TypeScript interfaces for all database tables
// No ORM decorators, just plain TypeScript types

// ============================================
// ANALYTICAL TABLES (Core Analytics)
// ============================================

export interface ProjectAnalytics {
  id: number;
  project_id: string;
  project_name: string;
  client_id?: string;
  client_name?: string;
  total_poles: number;
  completed_poles: number;
  total_drops: number;
  completed_drops: number;
  total_budget?: number;
  spent_budget?: number;
  start_date?: Date;
  end_date?: Date;
  actual_end_date?: Date;
  completion_percentage?: number;
  on_time_delivery?: boolean;
  quality_score?: number;
  last_synced_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface KpiMetrics {
  id: number;
  project_id?: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  unit?: string;
  team_id?: string;
  contractor_id?: string;
  recorded_date: Date;
  week_number?: number;
  month_number?: number;
  year?: number;
  created_at: Date;
}

export interface FinancialTransaction {
  id: string;
  transaction_type: string;
  project_id?: string;
  client_id?: string;
  supplier_id?: string;
  amount: number;
  currency: string;
  status: string;
  invoice_number?: string;
  po_number?: string;
  transaction_date: Date;
  due_date?: Date;
  paid_date?: Date;
  notes?: string;
  attachments?: any;
  created_by?: string;
  approved_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MaterialUsage {
  id: number;
  project_id: string;
  material_id: string;
  material_name: string;
  category?: string;
  planned_quantity?: number;
  used_quantity: number;
  wasted_quantity?: number;
  unit?: string;
  unit_cost?: number;
  total_cost?: number;
  pole_number?: string;
  section_id?: string;
  usage_date: Date;
  recorded_by?: string;
  created_at: Date;
}

export interface StaffPerformance {
  id: number;
  staff_id: string;
  staff_name: string;
  role?: string;
  tasks_completed: number;
  hours_worked?: number;
  productivity_score?: number;
  quality_score?: number;
  attendance_rate?: number;
  project_id?: string;
  team_id?: string;
  period_start: Date;
  period_end: Date;
  period_type?: string;
  overtime_hours?: number;
  incident_count: number;
  created_at: Date;
}

export interface ReportCache {
  id: number;
  report_type: string;
  report_name: string;
  filters?: any;
  project_id?: string;
  date_from?: Date;
  date_to?: Date;
  report_data: any;
  chart_data?: any;
  summary?: any;
  generated_by?: string;
  generated_at: Date;
  expires_at?: Date;
  access_count: number;
  generation_time_ms?: number;
  data_size_bytes?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  ip_address?: string;
  user_agent?: string;
  old_value?: any;
  new_value?: any;
  changes_summary?: string;
  timestamp: Date;
  session_id?: string;
  source?: string;
}

export interface ClientAnalytics {
  id: number;
  client_id: string;
  client_name: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_revenue?: number;
  outstanding_balance?: number;
  average_project_value?: number;
  payment_score?: number;
  average_project_duration?: number;
  on_time_completion_rate?: number;
  satisfaction_score?: number;
  last_project_date?: Date;
  next_follow_up_date?: Date;
  total_interactions: number;
  client_category?: string;
  lifetime_value?: number;
  last_calculated_at: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// CONTRACTOR MANAGEMENT TABLES
// ============================================

export interface Contractor {
  id: string;
  company_name: string;
  registration_number: string;
  contact_person: string;
  email: string;
  phone?: string;
  alternate_phone?: string;
  physical_address?: string;
  postal_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  business_type?: string;
  industry_category?: string;
  years_in_business?: number;
  employee_count?: number;
  annual_turnover?: number;
  credit_rating?: string;
  status: string;
  insurance_status?: string;
  insurance_expiry?: Date;
  rag_status?: string;
  rag_score?: number;
  onboarding_status?: string;
  onboarding_completed_at?: Date;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ContractorTeam {
  id: string;
  contractor_id: string;
  team_name: string;
  team_lead?: string;
  specialization?: string;
  status: string;
  daily_rate?: number;
  max_capacity?: number;
  current_utilization?: number;
  location_base?: string;
  coverage_areas?: string[];
  performance_rating?: number;
  created_at: Date;
  updated_at: Date;
}

export interface TeamMember {
  id: string;
  team_id: string;
  contractor_id: string;
  name: string;
  role: string;
  certification_status?: string;
  experience_years?: number;
  skills?: string[];
  id_number?: string;
  contact_number?: string;
  emergency_contact?: string;
  status: string;
  joined_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// PROCUREMENT TABLES
// ============================================

export interface BOQ {
  id: string;
  project_id: string;
  version?: string;
  name: string;
  description?: string;
  total_amount?: number;
  status: string;
  approved_by?: string;
  approved_date?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BOQItem {
  id: string;
  boq_id: string;
  item_code?: string;
  description: string;
  unit?: string;
  quantity?: number;
  unit_rate?: number;
  total_amount?: number;
  category?: string;
  specifications?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RFQ {
  id: string;
  rfq_number: string;
  project_id?: string;
  boq_id?: string;
  title: string;
  description?: string;
  status: string;
  submission_deadline?: Date;
  evaluation_criteria?: any;
  terms_conditions?: string;
  attachments?: any;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Supplier {
  id: string;
  company_name: string;
  registration_number?: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  category?: string;
  rating?: number;
  payment_terms?: string;
  tax_number?: string;
  bank_details?: any;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  project_id?: string;
  rfq_id?: string;
  status: string;
  total_amount?: number;
  currency: string;
  payment_terms?: string;
  delivery_date?: Date;
  delivery_address?: string;
  special_instructions?: string;
  approved_by?: string;
  approved_date?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// PROJECT MANAGEMENT TABLES
// ============================================

export interface Project {
  id: string;
  project_number: string;
  name: string;
  description?: string;
  client_id?: string;
  project_type?: string;
  status: string;
  priority?: string;
  start_date?: Date;
  end_date?: Date;
  actual_start_date?: Date;
  actual_end_date?: Date;
  budget?: number;
  spent_amount?: number;
  location?: string;
  gps_coordinates?: any;
  project_manager?: string;
  technical_lead?: string;
  site_supervisor?: string;
  completion_percentage?: number;
  milestones?: any;
  risks?: any;
  attachments?: any;
  metadata?: any;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  client_code?: string;
  company_name: string;
  contact_person?: string;
  email: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  industry?: string;
  website?: string;
  tax_number?: string;
  registration_number?: string;
  payment_terms?: string;
  credit_limit?: number;
  account_status: string;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Staff {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  role: string;
  status: string;
  hire_date?: Date;
  birth_date?: Date;
  id_number?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bank_details?: any;
  salary_info?: any;
  skills?: string[];
  certifications?: string[];
  performance_rating?: number;
  manager_id?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// SOW TRACKING TABLES
// ============================================

export interface SOWPole {
  id: string;
  project_id: string;
  pole_number: string;
  pole_type?: string;
  status: string;
  location?: string;
  gps_lat?: number;
  gps_lng?: number;
  height?: number;
  material?: string;
  installation_date?: Date;
  inspection_status?: string;
  inspection_date?: Date;
  condition_rating?: number;
  notes?: string;
  photos?: any;
  contractor_id?: string;
  team_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SOWDrop {
  id: string;
  project_id: string;
  drop_number: string;
  customer_name?: string;
  address?: string;
  drop_type?: string;
  status: string;
  cable_length?: number;
  installation_date?: Date;
  technician_id?: string;
  quality_check_status?: string;
  quality_check_date?: Date;
  notes?: string;
  photos?: any;
  created_at: Date;
  updated_at: Date;
}

export interface SOWFibre {
  id: string;
  project_id: string;
  section_id: string;
  cable_type?: string;
  cable_length?: number;
  from_location?: string;
  to_location?: string;
  status: string;
  installation_date?: Date;
  test_status?: string;
  test_date?: Date;
  signal_loss?: number;
  notes?: string;
  contractor_id?: string;
  team_id?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

export interface Document {
  id: string;
  entity_type: string;
  entity_id: string;
  document_type?: string;
  file_name: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  description?: string;
  version?: string;
  uploaded_by?: string;
  uploaded_at: Date;
  status?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// COMMUNICATION TABLES
// ============================================

export interface Communication {
  id: string;
  entity_type: string;
  entity_id: string;
  communication_type: string;
  subject?: string;
  message?: string;
  from_user?: string;
  to_users?: string[];
  cc_users?: string[];
  priority?: string;
  status?: string;
  read_by?: string[];
  attachments?: any;
  thread_id?: string;
  sent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// WORKFLOW TABLES
// ============================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  steps?: any;
  default_assignees?: any;
  estimated_duration?: number;
  is_active: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowInstance {
  id: string;
  template_id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  current_step?: number;
  data?: any;
  started_by?: string;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// INVENTORY TABLES
// ============================================

export interface Material {
  id: string;
  material_code: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  unit_cost?: number;
  reorder_level?: number;
  reorder_quantity?: number;
  supplier_id?: string;
  specifications?: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StockMovement {
  id: string;
  material_id: string;
  movement_type: string;
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  from_location?: string;
  to_location?: string;
  reason?: string;
  performed_by?: string;
  movement_date: Date;
  created_at: Date;
}

// ============================================
// SYSTEM TABLES
// ============================================

export interface Migration {
  id: number;
  version: string;
  name: string;
  executed_at: Date;
  execution_time_ms?: number;
  success: boolean;
  error_message?: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  category?: string;
  description?: string;
  is_encrypted: boolean;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// HELPER TYPES
// ============================================

export type QueryResult<T> = T[];
export type SingleResult<T> = T | null;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface FilterOptions {
  [key: string]: any;
}