/**
 * Analytics Reports Schema - Report Caching and Audit Logs
 */

import { pgTable, text, varchar, integer, timestamp, json, uuid, index } from 'drizzle-orm/pg-core';

// Report Cache (Pre-calculated Reports)
export const reportCache = pgTable('report_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportType: varchar('report_type', { length: 100 }).notNull(),
  reportKey: varchar('report_key', { length: 255 }).notNull(), // Unique identifier for report parameters
  
  // Filters (JSON serialized)
  filters: json('filters').notNull(),
  parameters: json('parameters'),
  
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

// Analytics Type Exports
export type ReportCache = typeof reportCache.$inferSelect;
export type NewReportCache = typeof reportCache.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;