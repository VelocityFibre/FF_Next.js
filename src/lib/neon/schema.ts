/**
 * Neon Database Schema for Analytical Data
 * This complements Firebase for reporting and analytics
 */

import { pgTable, serial, text, varchar, integer, decimal, timestamp, boolean, json, uuid, index, unique } from 'drizzle-orm/pg-core';
// import { relations } from 'drizzle-orm'; // Commented out until relations are defined

// ============================================
// ANALYTICAL TABLES (Neon PostgreSQL)
// ============================================

// Project Analytics (Historical Data)
export const projectAnalytics = pgTable('project_analytics', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(), // Firebase ID reference
  projectName: text('project_name').notNull(),
  clientId: varchar('client_id', { length: 255 }),
  clientName: text('client_name'),
  
  // Metrics
  totalPoles: integer('total_poles').default(0),
  completedPoles: integer('completed_poles').default(0),
  totalDrops: integer('total_drops').default(0),
  completedDrops: integer('completed_drops').default(0),
  
  // Financial
  totalBudget: decimal('total_budget', { precision: 15, scale: 2 }),
  spentBudget: decimal('spent_budget', { precision: 15, scale: 2 }),
  
  // Timeline
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  actualEndDate: timestamp('actual_end_date'),
  
  // Performance
  completionPercentage: decimal('completion_percentage', { precision: 5, scale: 2 }),
  onTimeDelivery: boolean('on_time_delivery'),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  
  // Metadata
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectIdIdx: index('project_id_idx').on(table.projectId),
    clientIdIdx: index('client_id_idx').on(table.clientId),
  }
});

// KPI Tracking (Time Series Data)
export const kpiMetrics = pgTable('kpi_metrics', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 255 }),
  metricType: varchar('metric_type', { length: 100 }).notNull(), // productivity, quality, safety, cost
  metricName: text('metric_name').notNull(),
  metricValue: decimal('metric_value', { precision: 15, scale: 4 }).notNull(),
  unit: varchar('unit', { length: 50 }),
  
  // Context
  teamId: varchar('team_id', { length: 255 }),
  contractorId: varchar('contractor_id', { length: 255 }),
  
  // Time
  recordedDate: timestamp('recorded_date').notNull(),
  weekNumber: integer('week_number'),
  monthNumber: integer('month_number'),
  year: integer('year'),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    projectMetricIdx: index('project_metric_idx').on(table.projectId, table.metricType),
    dateIdx: index('date_idx').on(table.recordedDate),
  }
});

// Financial Transactions (Audit Trail)
export const financialTransactions = pgTable('financial_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(), // invoice, payment, expense
  
  // References
  projectId: varchar('project_id', { length: 255 }),
  clientId: varchar('client_id', { length: 255 }),
  supplierId: varchar('supplier_id', { length: 255 }),
  
  // Financial Details
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  status: varchar('status', { length: 50 }).notNull(), // pending, approved, paid, cancelled
  
  // Documents
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  poNumber: varchar('po_number', { length: 100 }),
  
  // Dates
  transactionDate: timestamp('transaction_date').notNull(),
  dueDate: timestamp('due_date'),
  paidDate: timestamp('paid_date'),
  
  // Metadata
  notes: text('notes'),
  attachments: json('attachments'), // Array of file URLs
  createdBy: varchar('created_by', { length: 255 }),
  approvedBy: varchar('approved_by', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectIdx: index('financial_project_idx').on(table.projectId),
    clientIdx: index('financial_client_idx').on(table.clientId),
    statusIdx: index('financial_status_idx').on(table.status),
    invoiceNumberUnique: unique('invoice_number_unique').on(table.invoiceNumber),
  }
});

// Material Usage Analytics
export const materialUsage = pgTable('material_usage', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  materialId: varchar('material_id', { length: 255 }).notNull(),
  materialName: text('material_name').notNull(),
  category: varchar('category', { length: 100 }),
  
  // Quantities
  plannedQuantity: decimal('planned_quantity', { precision: 15, scale: 4 }),
  usedQuantity: decimal('used_quantity', { precision: 15, scale: 4 }).notNull(),
  wastedQuantity: decimal('wasted_quantity', { precision: 15, scale: 4 }),
  unit: varchar('unit', { length: 50 }),
  
  // Cost
  unitCost: decimal('unit_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  
  // Location
  poleNumber: varchar('pole_number', { length: 100 }),
  sectionId: varchar('section_id', { length: 255 }),
  
  // Time
  usageDate: timestamp('usage_date').notNull(),
  recordedBy: varchar('recorded_by', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    projectMaterialIdx: index('project_material_idx').on(table.projectId, table.materialId),
    usageDateIdx: index('usage_date_idx').on(table.usageDate),
  }
});

// Staff Performance Metrics
export const staffPerformance = pgTable('staff_performance', {
  id: serial('id').primaryKey(),
  staffId: varchar('staff_id', { length: 255 }).notNull(), // Firebase Auth UID
  staffName: text('staff_name').notNull(),
  role: varchar('role', { length: 100 }),
  
  // Performance Metrics
  tasksCompleted: integer('tasks_completed').default(0),
  hoursWorked: decimal('hours_worked', { precision: 10, scale: 2 }),
  productivityScore: decimal('productivity_score', { precision: 5, scale: 2 }),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  attendanceRate: decimal('attendance_rate', { precision: 5, scale: 2 }),
  
  // Project Context
  projectId: varchar('project_id', { length: 255 }),
  teamId: varchar('team_id', { length: 255 }),
  
  // Period
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  periodType: varchar('period_type', { length: 50 }), // daily, weekly, monthly
  
  // Calculations
  overtimeHours: decimal('overtime_hours', { precision: 10, scale: 2 }),
  incidentCount: integer('incident_count').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    staffPeriodIdx: index('staff_period_idx').on(table.staffId, table.periodStart),
    projectStaffIdx: index('project_staff_idx').on(table.projectId, table.staffId),
  }
});

// Report Cache (Pre-calculated Reports)
export const reportCache = pgTable('report_cache', {
  id: serial('id').primaryKey(),
  reportType: varchar('report_type', { length: 100 }).notNull(),
  reportName: text('report_name').notNull(),
  
  // Filters Applied
  filters: json('filters'), // JSON object of filter parameters
  projectId: varchar('project_id', { length: 255 }),
  dateFrom: timestamp('date_from'),
  dateTo: timestamp('date_to'),
  
  // Report Data
  reportData: json('report_data').notNull(), // Pre-calculated report data
  chartData: json('chart_data'), // Pre-formatted chart data
  summary: json('summary'), // Executive summary metrics
  
  // Metadata
  generatedBy: varchar('generated_by', { length: 255 }),
  generatedAt: timestamp('generated_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  accessCount: integer('access_count').default(0),
  
  // Performance
  generationTimeMs: integer('generation_time_ms'),
  dataSizeBytes: integer('data_size_bytes'),
}, (table) => {
  return {
    reportTypeIdx: index('report_type_idx').on(table.reportType),
    expiryIdx: index('expiry_idx').on(table.expiresAt),
  }
});

// Audit Log (Compliance & History)
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Action Details
  action: varchar('action', { length: 100 }).notNull(), // create, update, delete, view, export
  entityType: varchar('entity_type', { length: 100 }).notNull(), // project, pole, user, etc.
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  
  // User Context
  userId: varchar('user_id', { length: 255 }).notNull(),
  userName: text('user_name'),
  userRole: varchar('user_role', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  // Change Details
  oldValue: json('old_value'),
  newValue: json('new_value'),
  changesSummary: text('changes_summary'),
  
  // Metadata
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sessionId: varchar('session_id', { length: 255 }),
  source: varchar('source', { length: 50 }), // web, mobile, api
}, (table) => {
  return {
    userIdx: index('audit_user_idx').on(table.userId),
    entityIdx: index('audit_entity_idx').on(table.entityType, table.entityId),
    timestampIdx: index('audit_timestamp_idx').on(table.timestamp),
  }
});

// Client Analytics
export const clientAnalytics = pgTable('client_analytics', {
  id: serial('id').primaryKey(),
  clientId: varchar('client_id', { length: 255 }).notNull().unique(),
  clientName: text('client_name').notNull(),
  
  // Project Metrics
  totalProjects: integer('total_projects').default(0),
  activeProjects: integer('active_projects').default(0),
  completedProjects: integer('completed_projects').default(0),
  
  // Financial Metrics
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 }),
  outstandingBalance: decimal('outstanding_balance', { precision: 15, scale: 2 }),
  averageProjectValue: decimal('average_project_value', { precision: 15, scale: 2 }),
  paymentScore: decimal('payment_score', { precision: 5, scale: 2 }), // 0-100
  
  // Performance Metrics
  averageProjectDuration: integer('average_project_duration'), // days
  onTimeCompletionRate: decimal('on_time_completion_rate', { precision: 5, scale: 2 }),
  satisfactionScore: decimal('satisfaction_score', { precision: 5, scale: 2 }),
  
  // Engagement
  lastProjectDate: timestamp('last_project_date'),
  nextFollowUpDate: timestamp('next_follow_up_date'),
  totalInteractions: integer('total_interactions').default(0),
  
  // Calculated Fields
  clientCategory: varchar('client_category', { length: 50 }), // VIP, Regular, At-Risk
  lifetimeValue: decimal('lifetime_value', { precision: 15, scale: 2 }),
  
  lastCalculatedAt: timestamp('last_calculated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    clientIdIdx: index('client_analytics_id_idx').on(table.clientId),
    categoryIdx: index('client_category_idx').on(table.clientCategory),
  }
});

// ============================================
// CONTRACTOR MANAGEMENT TABLES
// ============================================

// Contractors (Core Entity)
export const contractors = pgTable('contractors', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyName: text('company_name').notNull(),
  registrationNumber: varchar('registration_number', { length: 50 }).notNull().unique(),
  
  // Contact Information
  contactPerson: text('contact_person').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  alternatePhone: varchar('alternate_phone', { length: 20 }),
  
  // Address
  physicalAddress: text('physical_address'),
  postalAddress: text('postal_address'),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 100 }),
  postalCode: varchar('postal_code', { length: 10 }),
  
  // Business Details
  businessType: varchar('business_type', { length: 50 }), // pty_ltd, cc, sole_proprietor
  industryCategory: varchar('industry_category', { length: 100 }),
  yearsInBusiness: integer('years_in_business'),
  employeeCount: integer('employee_count'),
  
  // Financial Information
  annualTurnover: decimal('annual_turnover', { precision: 15, scale: 2 }),
  creditRating: varchar('credit_rating', { length: 10 }),
  paymentTerms: varchar('payment_terms', { length: 50 }),
  bankName: varchar('bank_name', { length: 100 }),
  accountNumber: varchar('account_number', { length: 50 }),
  branchCode: varchar('branch_code', { length: 10 }),
  
  // Status & Compliance
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, approved, suspended, blacklisted
  isActive: boolean('is_active').default(true),
  complianceStatus: varchar('compliance_status', { length: 20 }).default('pending'),
  
  // RAG Scoring
  ragOverall: varchar('rag_overall', { length: 10 }).default('amber'), // red, amber, green
  ragFinancial: varchar('rag_financial', { length: 10 }).default('amber'),
  ragCompliance: varchar('rag_compliance', { length: 10 }).default('amber'),
  ragPerformance: varchar('rag_performance', { length: 10 }).default('amber'),
  ragSafety: varchar('rag_safety', { length: 10 }).default('amber'),
  
  // Performance Metrics
  performanceScore: decimal('performance_score', { precision: 5, scale: 2 }),
  safetyScore: decimal('safety_score', { precision: 5, scale: 2 }),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  timelinessScore: decimal('timeliness_score', { precision: 5, scale: 2 }),
  
  // Project Statistics
  totalProjects: integer('total_projects').default(0),
  completedProjects: integer('completed_projects').default(0),
  activeProjects: integer('active_projects').default(0),
  cancelledProjects: integer('cancelled_projects').default(0),
  
  // Onboarding
  onboardingProgress: integer('onboarding_progress').default(0), // 0-100
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  documentsExpiring: integer('documents_expiring').default(0),
  
  // Metadata
  notes: text('notes'),
  tags: json('tags'), // Array of tags
  lastActivity: timestamp('last_activity'),
  nextReviewDate: timestamp('next_review_date'),
  
  // Audit
  createdBy: varchar('created_by', { length: 255 }),
  updatedBy: varchar('updated_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    regNumberIdx: index('contractor_reg_number_idx').on(table.registrationNumber),
    statusIdx: index('contractor_status_idx').on(table.status),
    ragOverallIdx: index('contractor_rag_idx').on(table.ragOverall),
    emailIdx: index('contractor_email_idx').on(table.email),
  }
});

// Contractor Teams
export const contractorTeams = pgTable('contractor_teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  
  // Team Details
  teamName: text('team_name').notNull(),
  teamType: varchar('team_type', { length: 50 }), // installation, maintenance, survey
  specialization: varchar('specialization', { length: 100 }),
  
  // Capacity
  maxCapacity: integer('max_capacity').notNull(),
  currentCapacity: integer('current_capacity').default(0),
  availableCapacity: integer('available_capacity').default(0),
  
  // Performance
  efficiency: decimal('efficiency', { precision: 5, scale: 2 }),
  qualityRating: decimal('quality_rating', { precision: 5, scale: 2 }),
  safetyRecord: decimal('safety_record', { precision: 5, scale: 2 }),
  
  // Status
  isActive: boolean('is_active').default(true),
  availability: varchar('availability', { length: 20 }).default('available'), // available, busy, unavailable
  
  // Location
  baseLocation: text('base_location'),
  operatingRadius: integer('operating_radius'), // km
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    contractorTeamIdx: index('contractor_team_idx').on(table.contractorId),
    teamTypeIdx: index('team_type_idx').on(table.teamType),
  }
});

// Team Members
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull().references(() => contractorTeams.id, { onDelete: 'cascade' }),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  
  // Personal Details
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  idNumber: varchar('id_number', { length: 20 }).unique(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  
  // Professional Details
  role: varchar('role', { length: 50 }).notNull(),
  skillLevel: varchar('skill_level', { length: 20 }), // junior, intermediate, senior, expert
  certifications: json('certifications'), // Array of certifications
  specialSkills: json('special_skills'), // Array of skills
  
  // Employment
  employmentType: varchar('employment_type', { length: 20 }), // permanent, contract, temporary
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }),
  
  // Status
  isActive: boolean('is_active').default(true),
  isTeamLead: boolean('is_team_lead').default(false),
  
  // Performance
  performanceRating: decimal('performance_rating', { precision: 5, scale: 2 }),
  safetyScore: decimal('safety_score', { precision: 5, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    teamMemberIdx: index('team_member_idx').on(table.teamId),
    contractorMemberIdx: index('contractor_member_idx').on(table.contractorId),
    idNumberIdx: index('member_id_number_idx').on(table.idNumber),
  }
});

// Project Assignments
export const projectAssignments = pgTable('project_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(), // Firebase project ID
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id),
  teamId: uuid('team_id').references(() => contractorTeams.id),
  
  // Assignment Details
  assignmentType: varchar('assignment_type', { length: 50 }), // primary, subcontractor, consultant
  scope: text('scope').notNull(),
  responsibilities: json('responsibilities'), // Array of responsibilities
  
  // Timeline
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  actualStartDate: timestamp('actual_start_date'),
  actualEndDate: timestamp('actual_end_date'),
  
  // Financial
  contractValue: decimal('contract_value', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  outstandingAmount: decimal('outstanding_amount', { precision: 15, scale: 2 }),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('assigned'), // assigned, active, completed, cancelled
  progressPercentage: integer('progress_percentage').default(0),
  
  // Performance
  performanceRating: decimal('performance_rating', { precision: 5, scale: 2 }),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  timelinessScore: decimal('timeliness_score', { precision: 5, scale: 2 }),
  
  // Notes
  assignmentNotes: text('assignment_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectContractorIdx: index('project_contractor_idx').on(table.projectId, table.contractorId),
    contractorAssignmentIdx: index('contractor_assignment_idx').on(table.contractorId),
    statusIdx: index('assignment_status_idx').on(table.status),
  }
});

// Contractor Documents
export const contractorDocuments = pgTable('contractor_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  
  // Document Details
  documentType: varchar('document_type', { length: 50 }).notNull(), // tax_clearance, insurance, certifications
  documentName: text('document_name').notNull(),
  documentNumber: varchar('document_number', { length: 100 }),
  
  // File Information
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // bytes
  mimeType: varchar('mime_type', { length: 100 }),
  
  // Validity
  issueDate: timestamp('issue_date'),
  expiryDate: timestamp('expiry_date'),
  isExpired: boolean('is_expired').default(false),
  daysUntilExpiry: integer('days_until_expiry'),
  
  // Status
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending'), // pending, verified, rejected
  verifiedBy: varchar('verified_by', { length: 255 }),
  verifiedAt: timestamp('verified_at'),
  
  // Notes
  notes: text('notes'),
  rejectionReason: text('rejection_reason'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    contractorDocIdx: index('contractor_doc_idx').on(table.contractorId),
    docTypeIdx: index('doc_type_idx').on(table.documentType),
    docExpiryIdx: index('contractor_doc_expiry_idx').on(table.expiryDate),
  }
});

// Original tables (will be combined with procurement tables below)

// Type exports for TypeScript
export type ProjectAnalytics = typeof projectAnalytics.$inferSelect;
export type NewProjectAnalytics = typeof projectAnalytics.$inferInsert;

export type KPIMetrics = typeof kpiMetrics.$inferSelect;
export type NewKPIMetrics = typeof kpiMetrics.$inferInsert;

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type NewFinancialTransaction = typeof financialTransactions.$inferInsert;

export type MaterialUsage = typeof materialUsage.$inferSelect;
export type NewMaterialUsage = typeof materialUsage.$inferInsert;

export type StaffPerformance = typeof staffPerformance.$inferSelect;
export type NewStaffPerformance = typeof staffPerformance.$inferInsert;

export type ReportCache = typeof reportCache.$inferSelect;
export type NewReportCache = typeof reportCache.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;

export type ClientAnalytics = typeof clientAnalytics.$inferSelect;
export type NewClientAnalytics = typeof clientAnalytics.$inferInsert;

export type Contractor = typeof contractors.$inferSelect;
export type NewContractor = typeof contractors.$inferInsert;

export type ContractorTeam = typeof contractorTeams.$inferSelect;
export type NewContractorTeam = typeof contractorTeams.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type NewProjectAssignment = typeof projectAssignments.$inferInsert;

export type ContractorDocument = typeof contractorDocuments.$inferSelect;
export type NewContractorDocument = typeof contractorDocuments.$inferInsert;

// ============================================
// PROCUREMENT PORTAL TABLES
// ============================================

// BOQ (Bill of Quantities) Management
export const boqs = pgTable('boqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(), // Firebase project ID
  
  // BOQ Details
  version: varchar('version', { length: 50 }).notNull(),
  title: text('title'),
  description: text('description'),
  
  // Status and Workflow
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, mapping_review, approved, archived
  mappingStatus: varchar('mapping_status', { length: 20 }).default('pending'), // pending, in_progress, completed, failed
  mappingConfidence: decimal('mapping_confidence', { precision: 5, scale: 2 }), // 0-100
  
  // Upload Information
  uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  fileName: text('file_name'),
  fileUrl: text('file_url'),
  fileSize: integer('file_size'), // bytes
  
  // Approval Workflow
  approvedBy: varchar('approved_by', { length: 255 }),
  approvedAt: timestamp('approved_at'),
  rejectedBy: varchar('rejected_by', { length: 255 }),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  
  // Metadata
  itemCount: integer('item_count').default(0),
  mappedItems: integer('mapped_items').default(0),
  unmappedItems: integer('unmapped_items').default(0),
  exceptionsCount: integer('exceptions_count').default(0),
  
  // Totals
  totalEstimatedValue: decimal('total_estimated_value', { precision: 15, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectIdIdx: index('boq_project_id_idx').on(table.projectId),
    statusIdx: index('boq_status_idx').on(table.status),
    uploadedByIdx: index('boq_uploaded_by_idx').on(table.uploadedBy),
    versionUnique: unique('boq_project_version_unique').on(table.projectId, table.version),
  }
});

// BOQ Items
export const boqItems = pgTable('boq_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  boqId: uuid('boq_id').notNull().references(() => boqs.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }).notNull(), // Denormalized for performance
  
  // Line Item Details
  lineNumber: integer('line_number').notNull(),
  itemCode: varchar('item_code', { length: 100 }),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  subcategory: varchar('subcategory', { length: 100 }),
  
  // Quantities and Units
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  uom: varchar('uom', { length: 20 }).notNull(), // unit of measure
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }),
  totalPrice: decimal('total_price', { precision: 15, scale: 2 }),
  
  // Project Structure
  phase: varchar('phase', { length: 100 }),
  task: varchar('task', { length: 100 }),
  site: varchar('site', { length: 100 }),
  location: varchar('location', { length: 100 }),
  
  // Catalog Mapping
  catalogItemId: varchar('catalog_item_id', { length: 255 }),
  catalogItemCode: varchar('catalog_item_code', { length: 100 }),
  catalogItemName: text('catalog_item_name'),
  mappingConfidence: decimal('mapping_confidence', { precision: 5, scale: 2 }),
  mappingStatus: varchar('mapping_status', { length: 20 }).default('pending'), // pending, mapped, manual, exception
  
  // Technical Specifications
  specifications: json('specifications'),
  technicalNotes: text('technical_notes'),
  alternativeItems: json('alternative_items'), // Array of alternative catalog items
  
  // Procurement Status
  procurementStatus: varchar('procurement_status', { length: 20 }).default('pending'), // pending, rfq_created, quoted, awarded, ordered
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    boqItemIdx: index('boq_item_boq_id_idx').on(table.boqId),
    projectItemIdx: index('boq_item_project_id_idx').on(table.projectId),
    lineNumberIdx: index('boq_item_line_number_idx').on(table.boqId, table.lineNumber),
    catalogMappingIdx: index('boq_item_catalog_mapping_idx').on(table.catalogItemId),
    procurementStatusIdx: index('boq_item_procurement_status_idx').on(table.procurementStatus),
    lineNumberUnique: unique('boq_item_line_number_unique').on(table.boqId, table.lineNumber),
  }
});

// BOQ Mapping Exceptions
export const boqExceptions = pgTable('boq_exceptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  boqId: uuid('boq_id').notNull().references(() => boqs.id, { onDelete: 'cascade' }),
  boqItemId: uuid('boq_item_id').notNull().references(() => boqItems.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Exception Details
  exceptionType: varchar('exception_type', { length: 50 }).notNull(), // no_match, multiple_matches, data_issue, manual_review
  severity: varchar('severity', { length: 20 }).notNull().default('medium'), // low, medium, high, critical
  
  // Issue Description
  issueDescription: text('issue_description').notNull(),
  suggestedAction: text('suggested_action'),
  systemSuggestions: json('system_suggestions'), // Array of suggested mappings
  
  // Resolution
  status: varchar('status', { length: 20 }).notNull().default('open'), // open, in_review, resolved, ignored
  resolvedBy: varchar('resolved_by', { length: 255 }),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  resolutionAction: varchar('resolution_action', { length: 50 }), // manual_mapping, catalog_update, item_split, item_ignore
  
  // Assignment
  assignedTo: varchar('assigned_to', { length: 255 }),
  assignedAt: timestamp('assigned_at'),
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high, urgent
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    boqExceptionIdx: index('boq_exception_boq_id_idx').on(table.boqId),
    itemExceptionIdx: index('boq_exception_item_id_idx').on(table.boqItemId),
    statusIdx: index('boq_exception_status_idx').on(table.status),
    assignedToIdx: index('boq_exception_assigned_idx').on(table.assignedTo),
  }
});

// RFQ (Request for Quote) Management
export const rfqs = pgTable('rfqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // RFQ Details
  rfqNumber: varchar('rfq_number', { length: 100 }).notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  
  // Status and Timeline
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, issued, responses_received, evaluated, awarded, cancelled
  issueDate: timestamp('issue_date'),
  responseDeadline: timestamp('response_deadline').notNull(),
  extendedDeadline: timestamp('extended_deadline'),
  closedAt: timestamp('closed_at'),
  
  // Created By
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  issuedBy: varchar('issued_by', { length: 255 }),
  
  // Terms and Conditions
  paymentTerms: text('payment_terms'),
  deliveryTerms: text('delivery_terms'),
  validityPeriod: integer('validity_period'), // days
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  
  // Evaluation Criteria
  evaluationCriteria: json('evaluation_criteria'), // Weighted criteria object
  technicalRequirements: text('technical_requirements'),
  
  // Supplier Management
  invitedSuppliers: json('invited_suppliers'), // Array of supplier IDs
  respondedSuppliers: json('responded_suppliers'), // Array of supplier IDs who responded
  
  // Totals and Statistics
  itemCount: integer('item_count').default(0),
  totalBudgetEstimate: decimal('total_budget_estimate', { precision: 15, scale: 2 }),
  lowestQuoteValue: decimal('lowest_quote_value', { precision: 15, scale: 2 }),
  highestQuoteValue: decimal('highest_quote_value', { precision: 15, scale: 2 }),
  averageQuoteValue: decimal('average_quote_value', { precision: 15, scale: 2 }),
  
  // Award Information
  awardedAt: timestamp('awarded_at'),
  awardedTo: varchar('awarded_to', { length: 255 }), // Supplier ID
  awardNotes: text('award_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectRfqIdx: index('rfq_project_id_idx').on(table.projectId),
    statusIdx: index('rfq_status_idx').on(table.status),
    rfqNumberIdx: index('rfq_number_idx').on(table.rfqNumber),
    deadlineIdx: index('rfq_deadline_idx').on(table.responseDeadline),
  }
});

// RFQ Items
export const rfqItems = pgTable('rfq_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  rfqId: uuid('rfq_id').notNull().references(() => rfqs.id, { onDelete: 'cascade' }),
  boqItemId: uuid('boq_item_id').references(() => boqItems.id),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Item Details (copied from BOQ for historical record)
  lineNumber: integer('line_number').notNull(),
  itemCode: varchar('item_code', { length: 100 }),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  
  // Quantities
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  uom: varchar('uom', { length: 20 }).notNull(),
  budgetPrice: decimal('budget_price', { precision: 15, scale: 2 }),
  
  // Technical Requirements
  specifications: json('specifications'),
  technicalRequirements: text('technical_requirements'),
  acceptableAlternatives: json('acceptable_alternatives'),
  
  // Evaluation
  evaluationWeight: decimal('evaluation_weight', { precision: 5, scale: 2 }).default('1.0'),
  isCriticalItem: boolean('is_critical_item').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    rfqItemIdx: index('rfq_item_rfq_id_idx').on(table.rfqId),
    boqReferenceIdx: index('rfq_item_boq_reference_idx').on(table.boqItemId),
    lineNumberUnique: unique('rfq_item_line_unique').on(table.rfqId, table.lineNumber),
  }
});

// Supplier Invitations
export const supplierInvitations = pgTable('supplier_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  rfqId: uuid('rfq_id').notNull().references(() => rfqs.id, { onDelete: 'cascade' }),
  supplierId: varchar('supplier_id', { length: 255 }).notNull(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Invitation Details
  supplierName: text('supplier_name').notNull(),
  supplierEmail: varchar('supplier_email', { length: 255 }).notNull(),
  contactPerson: text('contact_person'),
  
  // Status Tracking
  invitationStatus: varchar('invitation_status', { length: 20 }).notNull().default('sent'), // sent, viewed, responded, declined, expired
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  viewedAt: timestamp('viewed_at'),
  respondedAt: timestamp('responded_at'),
  declinedAt: timestamp('declined_at'),
  
  // Authentication for supplier portal
  accessToken: varchar('access_token', { length: 255 }).unique(),
  tokenExpiresAt: timestamp('token_expires_at'),
  magicLinkToken: varchar('magic_link_token', { length: 255 }),
  lastLoginAt: timestamp('last_login_at'),
  
  // Communication
  invitationMessage: text('invitation_message'),
  declineReason: text('decline_reason'),
  remindersSent: integer('reminders_sent').default(0),
  lastReminderAt: timestamp('last_reminder_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    rfqSupplierIdx: index('supplier_invitation_rfq_supplier_idx').on(table.rfqId, table.supplierId),
    supplierIdx: index('supplier_invitation_supplier_idx').on(table.supplierId),
    statusIdx: index('supplier_invitation_status_idx').on(table.invitationStatus),
    tokenIdx: index('supplier_invitation_token_idx').on(table.accessToken),
    rfqSupplierUnique: unique('rfq_supplier_unique').on(table.rfqId, table.supplierId),
  }
});

// Quotes
export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  rfqId: uuid('rfq_id').notNull().references(() => rfqs.id, { onDelete: 'cascade' }),
  supplierId: varchar('supplier_id', { length: 255 }).notNull(),
  supplierInvitationId: uuid('supplier_invitation_id').references(() => supplierInvitations.id),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Quote Details
  quoteNumber: varchar('quote_number', { length: 100 }),
  quoteReference: varchar('quote_reference', { length: 100 }),
  
  // Status and Dates
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, submitted, under_review, accepted, rejected, expired
  submissionDate: timestamp('submission_date').defaultNow(),
  validUntil: timestamp('valid_until').notNull(),
  
  // Financial Summary
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('ZAR'),
  
  // Terms
  leadTime: integer('lead_time'), // days
  paymentTerms: text('payment_terms'),
  deliveryTerms: text('delivery_terms'),
  warrantyTerms: text('warranty_terms'),
  validityPeriod: integer('validity_period'), // days
  
  // Additional Information
  notes: text('notes'),
  terms: text('terms'),
  conditions: text('conditions'),
  
  // Evaluation
  evaluationScore: decimal('evaluation_score', { precision: 5, scale: 2 }),
  technicalScore: decimal('technical_score', { precision: 5, scale: 2 }),
  commercialScore: decimal('commercial_score', { precision: 5, scale: 2 }),
  evaluationNotes: text('evaluation_notes'),
  isWinner: boolean('is_winner').default(false),
  
  // Award Information
  awardedAt: timestamp('awarded_at'),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    rfqQuoteIdx: index('quote_rfq_id_idx').on(table.rfqId),
    supplierQuoteIdx: index('quote_supplier_id_idx').on(table.supplierId),
    statusIdx: index('quote_status_idx').on(table.status),
    submissionDateIdx: index('quote_submission_date_idx').on(table.submissionDate),
  }
});

// Quote Items
export const quoteItems = pgTable('quote_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  rfqItemId: uuid('rfq_item_id').notNull().references(() => rfqItems.id),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Item Reference (from RFQ)
  lineNumber: integer('line_number').notNull(),
  itemCode: varchar('item_code', { length: 100 }),
  description: text('description').notNull(),
  
  // Quoted Quantities and Pricing
  quotedQuantity: decimal('quoted_quantity', { precision: 15, scale: 4 }),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 15, scale: 2 }).notNull(),
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }),
  
  // Alternative Offerings
  alternateOffered: boolean('alternate_offered').default(false),
  alternateDescription: text('alternate_description'),
  alternatePartNumber: varchar('alternate_part_number', { length: 100 }),
  alternateUnitPrice: decimal('alternate_unit_price', { precision: 15, scale: 2 }),
  
  // Delivery and Terms
  leadTime: integer('lead_time'), // days
  minimumOrderQuantity: decimal('minimum_order_quantity', { precision: 15, scale: 4 }),
  packagingUnit: varchar('packaging_unit', { length: 50 }),
  
  // Technical Information
  manufacturerName: varchar('manufacturer_name', { length: 255 }),
  partNumber: varchar('part_number', { length: 100 }),
  modelNumber: varchar('model_number', { length: 100 }),
  technicalNotes: text('technical_notes'),
  complianceCertificates: json('compliance_certificates'),
  
  // Evaluation
  technicalCompliance: boolean('technical_compliance').default(true),
  commercialScore: decimal('commercial_score', { precision: 5, scale: 2 }),
  technicalScore: decimal('technical_score', { precision: 5, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    quoteItemIdx: index('quote_item_quote_id_idx').on(table.quoteId),
    rfqItemReferenceIdx: index('quote_item_rfq_reference_idx').on(table.rfqItemId),
    lineNumberUnique: unique('quote_item_line_unique').on(table.quoteId, table.lineNumber),
  }
});

// Quote Documents (certificates, technical sheets, etc.)
export const quoteDocuments = pgTable('quote_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  quoteItemId: uuid('quote_item_id').references(() => quoteItems.id),
  
  // Document Details
  documentType: varchar('document_type', { length: 50 }).notNull(), // certificate, datasheet, warranty, compliance, other
  documentName: text('document_name').notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // bytes
  mimeType: varchar('mime_type', { length: 100 }),
  
  // Metadata
  description: text('description'),
  isRequired: boolean('is_required').default(false),
  validUntil: timestamp('valid_until'),
  
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    quoteDocIdx: index('quote_document_quote_id_idx').on(table.quoteId),
    itemDocIdx: index('quote_document_item_id_idx').on(table.quoteItemId),
    docTypeIdx: index('quote_document_type_idx').on(table.documentType),
  }
});

// Stock Management
export const stockPositions = pgTable('stock_positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Item Details
  itemCode: varchar('item_code', { length: 100 }).notNull(),
  itemName: text('item_name').notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  uom: varchar('uom', { length: 20 }).notNull(),
  
  // Stock Quantities
  onHandQuantity: decimal('on_hand_quantity', { precision: 15, scale: 4 }).default('0'),
  reservedQuantity: decimal('reserved_quantity', { precision: 15, scale: 4 }).default('0'),
  availableQuantity: decimal('available_quantity', { precision: 15, scale: 4 }).default('0'),
  inTransitQuantity: decimal('in_transit_quantity', { precision: 15, scale: 4 }).default('0'),
  
  // Valuation
  averageUnitCost: decimal('average_unit_cost', { precision: 15, scale: 2 }),
  totalValue: decimal('total_value', { precision: 15, scale: 2 }),
  
  // Location
  warehouseLocation: varchar('warehouse_location', { length: 100 }),
  binLocation: varchar('bin_location', { length: 50 }),
  
  // Reorder Information
  reorderLevel: decimal('reorder_level', { precision: 15, scale: 4 }),
  maxStockLevel: decimal('max_stock_level', { precision: 15, scale: 4 }),
  economicOrderQuantity: decimal('economic_order_quantity', { precision: 15, scale: 4 }),
  
  // Tracking
  lastMovementDate: timestamp('last_movement_date'),
  lastCountDate: timestamp('last_count_date'),
  nextCountDue: timestamp('next_count_due'),
  
  // Status
  isActive: boolean('is_active').default(true),
  stockStatus: varchar('stock_status', { length: 20 }).default('normal'), // normal, low, critical, excess, obsolete
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectStockIdx: index('stock_position_project_idx').on(table.projectId),
    itemCodeIdx: index('stock_position_item_code_idx').on(table.projectId, table.itemCode),
    categoryIdx: index('stock_position_category_idx').on(table.category),
    stockStatusIdx: index('stock_position_status_idx').on(table.stockStatus),
    projectItemUnique: unique('stock_position_project_item_unique').on(table.projectId, table.itemCode),
  }
});

// Stock Movements
export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Movement Details
  movementType: varchar('movement_type', { length: 20 }).notNull(), // ASN, GRN, ISSUE, RETURN, TRANSFER, ADJUSTMENT
  referenceNumber: varchar('reference_number', { length: 100 }).notNull(),
  referenceType: varchar('reference_type', { length: 50 }), // PO, RFQ, WORK_ORDER, MANUAL
  referenceId: varchar('reference_id', { length: 255 }),
  
  // Locations
  fromLocation: varchar('from_location', { length: 100 }),
  toLocation: varchar('to_location', { length: 100 }),
  fromProjectId: varchar('from_project_id', { length: 255 }),
  toProjectId: varchar('to_project_id', { length: 255 }),
  
  // Status and Dates
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, completed, cancelled
  movementDate: timestamp('movement_date').notNull(),
  confirmedAt: timestamp('confirmed_at'),
  
  // Personnel
  requestedBy: varchar('requested_by', { length: 255 }),
  authorizedBy: varchar('authorized_by', { length: 255 }),
  processedBy: varchar('processed_by', { length: 255 }),
  
  // Notes and Documentation
  notes: text('notes'),
  reason: text('reason'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectMovementIdx: index('stock_movement_project_idx').on(table.projectId),
    typeIdx: index('stock_movement_type_idx').on(table.movementType),
    statusIdx: index('stock_movement_status_idx').on(table.status),
    referenceIdx: index('stock_movement_reference_idx').on(table.referenceType, table.referenceId),
    movementDateIdx: index('stock_movement_date_idx').on(table.movementDate),
  }
});

// Stock Movement Items
export const stockMovementItems = pgTable('stock_movement_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  movementId: uuid('movement_id').notNull().references(() => stockMovements.id, { onDelete: 'cascade' }),
  stockPositionId: uuid('stock_position_id').references(() => stockPositions.id),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Item Details
  itemCode: varchar('item_code', { length: 100 }).notNull(),
  itemName: text('item_name').notNull(),
  description: text('description'),
  uom: varchar('uom', { length: 20 }).notNull(),
  
  // Quantities
  plannedQuantity: decimal('planned_quantity', { precision: 15, scale: 4 }).notNull(),
  actualQuantity: decimal('actual_quantity', { precision: 15, scale: 4 }),
  receivedQuantity: decimal('received_quantity', { precision: 15, scale: 4 }),
  
  // Costing
  unitCost: decimal('unit_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  
  // Lot/Serial Tracking
  lotNumbers: json('lot_numbers'), // Array of lot numbers
  serialNumbers: json('serial_numbers'), // Array of serial numbers
  
  // Status
  itemStatus: varchar('item_status', { length: 20 }).default('pending'), // pending, confirmed, completed, damaged, rejected
  
  // Quality Control
  qualityCheckRequired: boolean('quality_check_required').default(false),
  qualityCheckStatus: varchar('quality_check_status', { length: 20 }), // pending, passed, failed, waived
  qualityNotes: text('quality_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    movementItemIdx: index('stock_movement_item_movement_idx').on(table.movementId),
    stockPositionIdx: index('stock_movement_item_position_idx').on(table.stockPositionId),
    itemCodeIdx: index('stock_movement_item_code_idx').on(table.itemCode),
  }
});

// Cable Drum Tracking (Special case for cable materials)
export const cableDrums = pgTable('cable_drums', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  stockPositionId: uuid('stock_position_id').references(() => stockPositions.id),
  
  // Drum Identification
  drumNumber: varchar('drum_number', { length: 100 }).notNull(),
  serialNumber: varchar('serial_number', { length: 100 }),
  supplierDrumId: varchar('supplier_drum_id', { length: 100 }),
  
  // Cable Details
  cableType: varchar('cable_type', { length: 100 }).notNull(),
  cableSpecification: text('cable_specification'),
  manufacturerName: varchar('manufacturer_name', { length: 255 }),
  partNumber: varchar('part_number', { length: 100 }),
  
  // Drum Measurements
  originalLength: decimal('original_length', { precision: 10, scale: 2 }).notNull(), // meters
  currentLength: decimal('current_length', { precision: 10, scale: 2 }).notNull(),
  usedLength: decimal('used_length', { precision: 10, scale: 2 }).default('0'),
  
  // Physical Properties
  drumWeight: decimal('drum_weight', { precision: 10, scale: 2 }), // kg
  cableWeight: decimal('cable_weight', { precision: 10, scale: 2 }), // kg
  drumDiameter: decimal('drum_diameter', { precision: 8, scale: 2 }), // mm
  
  // Location and Status
  currentLocation: varchar('current_location', { length: 100 }),
  drumCondition: varchar('drum_condition', { length: 20 }).default('good'), // good, damaged, returnable
  installationStatus: varchar('installation_status', { length: 20 }).default('available'), // available, in_use, completed, returned
  
  // Tracking History
  lastMeterReading: decimal('last_meter_reading', { precision: 10, scale: 2 }),
  lastReadingDate: timestamp('last_reading_date'),
  lastUsedDate: timestamp('last_used_date'),
  
  // Quality and Testing
  testCertificate: text('test_certificate'),
  installationNotes: text('installation_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectDrumIdx: index('cable_drum_project_idx').on(table.projectId),
    drumNumberIdx: index('cable_drum_number_idx').on(table.projectId, table.drumNumber),
    serialNumberIdx: index('cable_drum_serial_idx').on(table.serialNumber),
    locationIdx: index('cable_drum_location_idx').on(table.currentLocation),
    statusIdx: index('cable_drum_status_idx').on(table.installationStatus),
    drumNumberUnique: unique('cable_drum_project_number_unique').on(table.projectId, table.drumNumber),
  }
});

// Drum Usage History
export const drumUsageHistory = pgTable('drum_usage_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  drumId: uuid('drum_id').notNull().references(() => cableDrums.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  
  // Usage Details
  usageDate: timestamp('usage_date').notNull(),
  poleNumber: varchar('pole_number', { length: 100 }),
  sectionId: varchar('section_id', { length: 255 }),
  workOrderId: varchar('work_order_id', { length: 255 }),
  
  // Measurements
  previousReading: decimal('previous_reading', { precision: 10, scale: 2 }).notNull(),
  currentReading: decimal('current_reading', { precision: 10, scale: 2 }).notNull(),
  usedLength: decimal('used_length', { precision: 10, scale: 2 }).notNull(),
  
  // Personnel and Equipment
  technicianId: varchar('technician_id', { length: 255 }),
  technicianName: text('technician_name'),
  equipmentUsed: text('equipment_used'),
  
  // Installation Details
  installationType: varchar('installation_type', { length: 50 }), // overhead, underground, building
  installationNotes: text('installation_notes'),
  qualityNotes: text('quality_notes'),
  
  // GPS Coordinates
  startCoordinates: json('start_coordinates'), // {lat, lng}
  endCoordinates: json('end_coordinates'), // {lat, lng}
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    drumUsageIdx: index('drum_usage_drum_id_idx').on(table.drumId),
    projectUsageIdx: index('drum_usage_project_idx').on(table.projectId),
    dateIdx: index('drum_usage_date_idx').on(table.usageDate),
    poleIdx: index('drum_usage_pole_idx').on(table.poleNumber),
  }
});

// Export updated tables object
export const neonTables = {
  // Existing tables
  projectAnalytics,
  kpiMetrics,
  financialTransactions,
  materialUsage,
  staffPerformance,
  reportCache,
  auditLog,
  clientAnalytics,
  contractors,
  contractorTeams,
  teamMembers,
  projectAssignments,
  contractorDocuments,
  // New Procurement tables
  boqs,
  boqItems,
  boqExceptions,
  rfqs,
  rfqItems,
  supplierInvitations,
  quotes,
  quoteItems,
  quoteDocuments,
  stockPositions,
  stockMovements,
  stockMovementItems,
  cableDrums,
  drumUsageHistory,
};

// Procurement Type Exports for TypeScript
export type BOQ = typeof boqs.$inferSelect;
export type NewBOQ = typeof boqs.$inferInsert;

export type BOQItem = typeof boqItems.$inferSelect;
export type NewBOQItem = typeof boqItems.$inferInsert;

export type BOQException = typeof boqExceptions.$inferSelect;
export type NewBOQException = typeof boqExceptions.$inferInsert;

export type RFQ = typeof rfqs.$inferSelect;
export type NewRFQ = typeof rfqs.$inferInsert;

export type RFQItem = typeof rfqItems.$inferSelect;
export type NewRFQItem = typeof rfqItems.$inferInsert;

export type SupplierInvitation = typeof supplierInvitations.$inferSelect;
export type NewSupplierInvitation = typeof supplierInvitations.$inferInsert;

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;

export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;

export type QuoteDocument = typeof quoteDocuments.$inferSelect;
export type NewQuoteDocument = typeof quoteDocuments.$inferInsert;

export type StockPosition = typeof stockPositions.$inferSelect;
export type NewStockPosition = typeof stockPositions.$inferInsert;

export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;

export type StockMovementItem = typeof stockMovementItems.$inferSelect;
export type NewStockMovementItem = typeof stockMovementItems.$inferInsert;

export type CableDrum = typeof cableDrums.$inferSelect;
export type NewCableDrum = typeof cableDrums.$inferInsert;

export type DrumUsageHistory = typeof drumUsageHistory.$inferSelect;
export type NewDrumUsageHistory = typeof drumUsageHistory.$inferInsert;