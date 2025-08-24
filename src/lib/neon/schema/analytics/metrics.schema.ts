/**
 * Analytics Metrics Schema - Project and Client Performance Metrics
 */

import { pgTable, serial, text, varchar, integer, decimal, timestamp, boolean, index } from 'drizzle-orm/pg-core';

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

// Financial Transactions (Audit Trail)
export const financialTransactions = pgTable('financial_transactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
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
  description: text('description'),
  notes: text('notes'),
  
  createdBy: varchar('created_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectFinanceIdx: index('project_finance_idx').on(table.projectId),
    transactionDateIdx: index('transaction_date_idx').on(table.transactionDate),
    statusIdx: index('finance_status_idx').on(table.status),
  }
});

// Analytics Type Exports
export type ProjectAnalytics = typeof projectAnalytics.$inferSelect;
export type NewProjectAnalytics = typeof projectAnalytics.$inferInsert;

export type ClientAnalytics = typeof clientAnalytics.$inferSelect;
export type NewClientAnalytics = typeof clientAnalytics.$inferInsert;

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type NewFinancialTransaction = typeof financialTransactions.$inferInsert;