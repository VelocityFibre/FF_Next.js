/**
 * Analytics Services - Modular Export
 * Centralized export for all analytics modules
 */

// Export types
export type * from './types';

// Export specialized services
export { projectAnalyticsService } from './projectAnalytics';
export { kpiAnalyticsService } from './kpiAnalytics';
export { financialAnalyticsService } from './financialAnalytics';
export { staffAnalyticsService } from './staffAnalytics';
export { clientAnalyticsService } from './clientAnalytics';
export { auditService } from './auditService';
export { reportingService } from './reportingService';

// Export service classes for advanced usage
export { ProjectAnalyticsService } from './projectAnalytics';
export { KPIAnalyticsService } from './kpiAnalytics';
export { FinancialAnalyticsService } from './financialAnalytics';
export { StaffAnalyticsService } from './staffAnalytics';
export { ClientAnalyticsService } from './clientAnalytics';
export { AuditService } from './auditService';
export { ReportingService } from './reportingService';

// Main orchestrator service (legacy compatibility)
export { AnalyticsService, analyticsService } from './core';