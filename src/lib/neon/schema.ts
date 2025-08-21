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