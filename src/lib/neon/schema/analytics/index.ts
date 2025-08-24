/**
 * Analytics Schema - Barrel Export
 * Provides centralized access to all analytics-related database schemas
 */

// KPI and Performance Metrics
export {
  kpiMetrics,
  staffPerformance,
  materialUsage,
  type KPIMetrics,
  type NewKPIMetrics,
  type StaffPerformance,
  type NewStaffPerformance,
  type MaterialUsage,
  type NewMaterialUsage,
} from './kpi.schema';

// Reports and Audit
export {
  reportCache,
  auditLog,
  type ReportCache,
  type NewReportCache,
  type AuditLog,
  type NewAuditLog,
} from './reports.schema';

// Project and Client Metrics
export {
  projectAnalytics,
  clientAnalytics,
  financialTransactions,
  type ProjectAnalytics,
  type NewProjectAnalytics,
  type ClientAnalytics,
  type NewClientAnalytics,
  type FinancialTransaction,
  type NewFinancialTransaction,
} from './metrics.schema';