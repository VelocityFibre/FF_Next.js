/**
 * Analytics Schema - Legacy Compatibility Layer
 * @deprecated Use imports from ./analytics/* instead
 * 
 * This file provides backward compatibility for existing imports.
 * New code should import directly from the modular structure:
 * - import { kpiMetrics, projectAnalytics } from '@/lib/neon/schema/analytics'
 * 
 * Original file: 308 lines → Split into focused analytics modules
 */

// Re-export everything from the new modular structure
export {
  // KPI and Performance
  kpiMetrics,
  staffPerformance,
  materialUsage,
  type KPIMetrics,
  type NewKPIMetrics,
  type StaffPerformance,
  type NewStaffPerformance,
  type MaterialUsage,
  type NewMaterialUsage,
  
  // Reports and Audit
  reportCache,
  auditLog,
  type ReportCache,
  type NewReportCache,
  type AuditLog,
  type NewAuditLog,
  
  // Project and Client Metrics
  projectAnalytics,
  clientAnalytics,
  financialTransactions,
  type ProjectAnalytics,
  type NewProjectAnalytics,
  type ClientAnalytics,
  type NewClientAnalytics,
  type FinancialTransaction,
  type NewFinancialTransaction,
} from './analytics/index';