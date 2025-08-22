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
    expiryIdx: index('expiry_idx').on(table.expiryDate),
  }
});

// Export all tables
export const neonTables = {
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
};

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