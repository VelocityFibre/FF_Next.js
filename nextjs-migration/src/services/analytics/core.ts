/**
 * Analytics Service - Main Orchestrator
 * Unified interface for all analytics operations
 */

import { projectAnalyticsService } from './projectAnalytics';
import { kpiAnalyticsService } from './kpiAnalytics';
import { financialAnalyticsService } from './financialAnalytics';
import { staffAnalyticsService } from './staffAnalytics';
import { clientAnalyticsService } from './clientAnalytics';
import { auditService } from './auditService';
import { reportingService } from './reportingService';
import type {
  ProjectOverview,
  ProjectTrend,
  KPIDashboardItem,
  KPITrend,
  FinancialOverview,
  CashFlowTrend,
  StaffPerformanceSummary,
  ClientAnalyticsData,
  ExecutiveSummary,
  AuditEntry,
  AuditChanges,
  AuditMetadata
} from './types';

/**
 * Main Analytics Service class
 * Provides a unified interface for all analytics operations
 */
export class AnalyticsService {
  // Project Analytics
  async getProjectOverview(projectId?: string): Promise<ProjectOverview[]> {
    return projectAnalyticsService.getProjectOverview(projectId);
  }

  async getProjectTrends(dateFrom: Date, dateTo: Date): Promise<ProjectTrend[]> {
    return projectAnalyticsService.getProjectTrends(dateFrom, dateTo);
  }

  // KPI Analytics
  async getKPIDashboard(projectId?: string, dateFrom?: Date, dateTo?: Date): Promise<KPIDashboardItem[]> {
    return kpiAnalyticsService.getKPIDashboard(projectId, dateFrom, dateTo);
  }

  async getKPITrends(metricType: string, projectId?: string, days: number = 30): Promise<KPITrend[]> {
    return kpiAnalyticsService.getKPITrends(metricType, projectId, days);
  }

  // Financial Analytics
  async getFinancialOverview(projectId?: string): Promise<FinancialOverview[]> {
    return financialAnalyticsService.getFinancialOverview(projectId);
  }

  async getCashFlowTrends(months: number = 12): Promise<CashFlowTrend[]> {
    return financialAnalyticsService.getCashFlowTrends(months);
  }

  // Staff Analytics
  async getStaffPerformance(projectId?: string, periodType: string = 'monthly'): Promise<StaffPerformanceSummary[]> {
    return staffAnalyticsService.getStaffPerformance(projectId, periodType);
  }

  // Client Analytics
  async getClientAnalytics(clientId?: string): Promise<ClientAnalyticsData | ClientAnalyticsData[]> {
    return clientAnalyticsService.getClientAnalytics(clientId);
  }

  async getTopClients(limit: number = 10): Promise<ClientAnalyticsData[]> {
    return clientAnalyticsService.getTopClients(limit);
  }

  // Reporting
  async getExecutiveSummary(dateFrom: Date, dateTo: Date): Promise<ExecutiveSummary> {
    return reportingService.getExecutiveSummary(dateFrom, dateTo);
  }

  // Audit & Compliance
  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    userName: string,
    changes?: AuditChanges,
    metadata?: AuditMetadata
  ): Promise<void> {
    return auditService.logAction(action, entityType, entityId, userId, userName, changes, metadata);
  }

  async getAuditTrail(entityType: string, entityId: string, limit: number = 50): Promise<AuditEntry[]> {
    return auditService.getAuditTrail(entityType, entityId, limit);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();