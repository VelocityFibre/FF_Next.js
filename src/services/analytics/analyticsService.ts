/**
 * Analytics Service - Neon PostgreSQL for reporting and analytics
 * Complements Firebase real-time operations with analytical queries
 */

import { neonDb } from '@/lib/neon/connection';
import { 
  projectAnalytics, 
  kpiMetrics, 
  financialTransactions, 
  staffPerformance,
  clientAnalytics,
  auditLog,
} from '@/lib/neon/schema';
import { eq, and, gte, lte, desc, sql, count, sum, avg } from 'drizzle-orm';
// Types will be needed when implementing proper return types
// import type { 
//   KPIMetrics,
//   NewKPIMetrics, 
//   FinancialTransaction,
//   ClientAnalytics,
//   StaffPerformance
// } from '@/lib/neon/schema';

export class AnalyticsService {
  // ============================================
  // PROJECT ANALYTICS
  // ============================================

  /**
   * Get project performance overview
   */
  async getProjectOverview(projectId?: string) {
    try {
      const baseQuery = neonDb
        .select({
          totalProjects: count(projectAnalytics.id),
          totalBudget: sum(projectAnalytics.totalBudget),
          spentBudget: sum(projectAnalytics.spentBudget),
          avgCompletion: avg(projectAnalytics.completionPercentage),
        })
        .from(projectAnalytics);

      if (projectId) {
        return await baseQuery.where(eq(projectAnalytics.projectId, projectId));
      }

      return await baseQuery;
    } catch (error) {
      console.error('Failed to get project overview:', error);
      throw error;
    }
  }

  /**
   * Get project completion trends over time
   */
  async getProjectTrends(dateFrom: Date, dateTo: Date) {
    try {
      return await neonDb
        .select({
          month: sql<string>`DATE_TRUNC('month', ${projectAnalytics.createdAt})`,
          completedProjects: count(projectAnalytics.id),
          avgCompletion: avg(projectAnalytics.completionPercentage),
          totalBudget: sum(projectAnalytics.totalBudget),
        })
        .from(projectAnalytics)
        .where(
          and(
            gte(projectAnalytics.createdAt, dateFrom),
            lte(projectAnalytics.createdAt, dateTo)
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${projectAnalytics.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${projectAnalytics.createdAt})`);
    } catch (error) {
      console.error('Failed to get project trends:', error);
      throw error;
    }
  }

  // ============================================
  // KPI ANALYTICS
  // ============================================

  /**
   * Get KPI metrics for dashboard
   */
  async getKPIDashboard(projectId?: string, dateFrom?: Date, dateTo?: Date) {
    try {
      const conditions = [];
      if (projectId) conditions.push(eq(kpiMetrics.projectId, projectId));
      if (dateFrom) conditions.push(gte(kpiMetrics.recordedDate, dateFrom));
      if (dateTo) conditions.push(lte(kpiMetrics.recordedDate, dateTo));

      const baseQuery = neonDb
        .select({
          metricType: kpiMetrics.metricType,
          metricName: kpiMetrics.metricName,
          currentValue: avg(kpiMetrics.metricValue),
          unit: kpiMetrics.unit,
          recordCount: count(kpiMetrics.id),
        })
        .from(kpiMetrics)
        .groupBy(kpiMetrics.metricType, kpiMetrics.metricName, kpiMetrics.unit);

      if (conditions.length > 0) {
        return await baseQuery.where(and(...conditions));
      }

      return await baseQuery;
    } catch (error) {
      console.error('Failed to get KPI dashboard:', error);
      throw error;
    }
  }

  /**
   * Get KPI trends over time
   */
  async getKPITrends(metricType: string, projectId?: string, days: number = 30) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const conditions = [
        eq(kpiMetrics.metricType, metricType),
        gte(kpiMetrics.recordedDate, dateFrom)
      ];

      if (projectId) {
        conditions.push(eq(kpiMetrics.projectId, projectId));
      }

      return await neonDb
        .select({
          date: sql<string>`DATE(${kpiMetrics.recordedDate})`,
          value: avg(kpiMetrics.metricValue),
          count: count(kpiMetrics.id),
        })
        .from(kpiMetrics)
        .where(and(...conditions))
        .groupBy(sql`DATE(${kpiMetrics.recordedDate})`)
        .orderBy(sql`DATE(${kpiMetrics.recordedDate})`);
    } catch (error) {
      console.error('Failed to get KPI trends:', error);
      throw error;
    }
  }

  // ============================================
  // FINANCIAL ANALYTICS
  // ============================================

  /**
   * Get financial overview
   */
  async getFinancialOverview(projectId?: string) {
    try {
      const baseQuery = neonDb
        .select({
          totalInvoices: count(financialTransactions.id),
          totalAmount: sum(financialTransactions.amount),
          paidAmount: sql<number>`SUM(CASE WHEN ${financialTransactions.status} = 'paid' THEN ${financialTransactions.amount} ELSE 0 END)`,
          pendingAmount: sql<number>`SUM(CASE WHEN ${financialTransactions.status} = 'pending' THEN ${financialTransactions.amount} ELSE 0 END)`,
          overdueCount: sql<number>`COUNT(CASE WHEN ${financialTransactions.status} = 'pending' AND ${financialTransactions.dueDate} <= NOW() THEN 1 END)`,
        })
        .from(financialTransactions);

      if (projectId) {
        return await baseQuery.where(eq(financialTransactions.projectId, projectId));
      }

      return await baseQuery;
    } catch (error) {
      console.error('Failed to get financial overview:', error);
      throw error;
    }
  }

  /**
   * Get cash flow trends
   */
  async getCashFlowTrends(months: number = 12) {
    try {
      const dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - months);

      return await neonDb
        .select({
          month: sql<string>`DATE_TRUNC('month', ${financialTransactions.transactionDate})`,
          income: sql<number>`SUM(CASE WHEN ${financialTransactions.transactionType} = 'invoice' THEN ${financialTransactions.amount} ELSE 0 END)`,
          expenses: sql<number>`SUM(CASE WHEN ${financialTransactions.transactionType} = 'expense' THEN ${financialTransactions.amount} ELSE 0 END)`,
          netFlow: sql<number>`
            SUM(CASE WHEN ${financialTransactions.transactionType} = 'invoice' THEN ${financialTransactions.amount} ELSE 0 END) -
            SUM(CASE WHEN ${financialTransactions.transactionType} = 'expense' THEN ${financialTransactions.amount} ELSE 0 END)
          `,
        })
        .from(financialTransactions)
        .where(gte(financialTransactions.transactionDate, dateFrom))
        .groupBy(sql`DATE_TRUNC('month', ${financialTransactions.transactionDate})`)
        .orderBy(sql`DATE_TRUNC('month', ${financialTransactions.transactionDate})`);
    } catch (error) {
      console.error('Failed to get cash flow trends:', error);
      throw error;
    }
  }

  // ============================================
  // STAFF PERFORMANCE
  // ============================================

  /**
   * Get staff performance summary
   */
  async getStaffPerformance(projectId?: string, periodType: string = 'monthly') {
    try {
      const conditions = [eq(staffPerformance.periodType, periodType)];
      
      if (projectId) {
        conditions.push(eq(staffPerformance.projectId, projectId));
      }

      return await neonDb
        .select({
          staffName: staffPerformance.staffName,
          role: staffPerformance.role,
          avgProductivity: avg(staffPerformance.productivityScore),
          avgQuality: avg(staffPerformance.qualityScore),
          totalHours: sum(staffPerformance.hoursWorked),
          totalTasks: sum(staffPerformance.tasksCompleted),
          attendanceRate: avg(staffPerformance.attendanceRate),
        })
        .from(staffPerformance)
        .where(and(...conditions))
        .groupBy(staffPerformance.staffId, staffPerformance.staffName, staffPerformance.role);
    } catch (error) {
      console.error('Failed to get staff performance:', error);
      throw error;
    }
  }

  // ============================================
  // CLIENT ANALYTICS
  // ============================================

  /**
   * Get client performance metrics
   */
  async getClientAnalytics(clientId?: string) {
    try {
      const baseQuery = neonDb
        .select()
        .from(clientAnalytics)
        .orderBy(desc(clientAnalytics.lifetimeValue));

      if (clientId) {
        const result = await baseQuery.where(eq(clientAnalytics.clientId, clientId));
        return result[0];
      }

      return await baseQuery;
    } catch (error) {
      console.error('Failed to get client analytics:', error);
      throw error;
    }
  }

  /**
   * Get top clients by revenue
   */
  async getTopClients(limit: number = 10) {
    try {
      return await neonDb
        .select({
          clientId: clientAnalytics.clientId,
          clientName: clientAnalytics.clientName,
          totalRevenue: clientAnalytics.totalRevenue,
          totalProjects: clientAnalytics.totalProjects,
          lifetimeValue: clientAnalytics.lifetimeValue,
          paymentScore: clientAnalytics.paymentScore,
        })
        .from(clientAnalytics)
        .orderBy(desc(clientAnalytics.totalRevenue))
        .limit(limit);
    } catch (error) {
      console.error('Failed to get top clients:', error);
      throw error;
    }
  }

  // ============================================
  // CUSTOM REPORTS
  // ============================================

  /**
   * Generate executive summary report
   */
  async getExecutiveSummary(dateFrom: Date, dateTo: Date) {
    try {
      // Run multiple queries in parallel
      const [
        projectSummary,
        financialSummary,
        kpiSummary,
        topClients
      ] = await Promise.all([
        this.getProjectOverview(),
        this.getFinancialOverview(),
        this.getKPIDashboard(undefined, dateFrom, dateTo),
        this.getTopClients(5)
      ]);

      return {
        projects: projectSummary,
        financial: financialSummary,
        kpis: kpiSummary,
        topClients,
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo },
      };
    } catch (error) {
      console.error('Failed to generate executive summary:', error);
      throw error;
    }
  }

  // ============================================
  // AUDIT & COMPLIANCE
  // ============================================

  /**
   * Log user action for audit trail
   */
  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    userName: string,
    changes?: { old?: any; new?: any },
    metadata?: { ip?: string; userAgent?: string; sessionId?: string }
  ) {
    try {
      await neonDb.insert(auditLog).values({
        action,
        entityType,
        entityId,
        userId,
        userName,
        oldValue: changes?.old,
        newValue: changes?.new,
        ipAddress: metadata?.ip,
        userAgent: metadata?.userAgent,
        sessionId: metadata?.sessionId,
        source: 'web',
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw - audit logging shouldn't break main functionality
    }
  }

  /**
   * Get audit trail for entity
   */
  async getAuditTrail(entityType: string, entityId: string, limit: number = 50) {
    try {
      return await neonDb
        .select()
        .from(auditLog)
        .where(
          and(
            eq(auditLog.entityType, entityType),
            eq(auditLog.entityId, entityId)
          )
        )
        .orderBy(desc(auditLog.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('Failed to get audit trail:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();