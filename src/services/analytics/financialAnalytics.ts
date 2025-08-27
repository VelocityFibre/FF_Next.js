/**
 * Financial Analytics Service
 * Handles financial reporting and cash flow analysis
 */

import { neonDb } from '@/lib/neon/connection';
import { projects, sow } from '@/lib/neon/schema';
import { eq, gte, sql, count, sum } from 'drizzle-orm';
import type { FinancialOverview, CashFlowTrend } from './types';
import { log } from '@/lib/logger';

export class FinancialAnalyticsService {
  /**
   * Get financial overview
   */
  async getFinancialOverview(projectId?: string): Promise<FinancialOverview[]> {
    try {
      // Get real financial data from projects and SOW tables
      const baseQuery = neonDb
        .select({
          totalProjects: count(projects.id),
          totalBudget: sum(projects.budget),
          actualCost: sum(projects.actualCost),
          totalSOWValue: sql<number>`COALESCE(SUM(${sow.totalValue}), 0)`,
          paidAmount: sql<number>`COALESCE(SUM(${sow.paidAmount}), 0)`,
          pendingAmount: sql<number>`COALESCE(SUM(${sow.totalValue} - COALESCE(${sow.paidAmount}, 0)), 0)`,
          overdueSOWs: sql<number>`COUNT(CASE WHEN ${sow.status} = 'approved' AND ${sow.expiryDate} < CURRENT_DATE THEN 1 END)`,
        })
        .from(projects)
        .leftJoin(sow, eq(projects.id, sow.projectId));

      let results;
      if (projectId) {
        results = await baseQuery.where(eq(projects.id, projectId));
      } else {
        results = await baseQuery;
      }

      // Transform results with real data
      return results.map(row => ({
        totalInvoices: row.totalProjects || 0, // Using projects as invoice proxy
        totalAmount: Number(row.totalSOWValue || 0),
        paidAmount: row.paidAmount || 0,
        pendingAmount: row.pendingAmount || 0,
        overdueCount: row.overdueSOWs || 0,
        // Real financial metrics
        totalRevenue: Number(row.totalSOWValue || 0),
        totalExpenses: Number(row.actualCost || 0),
        netProfit: (row.paidAmount || 0) - Number(row.actualCost || 0),
        profitMargin: (row.paidAmount || 0) > 0 ? (((row.paidAmount || 0) - Number(row.actualCost || 0)) / (row.paidAmount || 0)) * 100 : 0,
        cashFlow: (row.paidAmount || 0) - (row.pendingAmount || 0),
        budgetUtilization: Number(row.totalBudget || 0) > 0 ? (Number(row.actualCost || 0) / Number(row.totalBudget || 0)) * 100 : 0
      }));
    } catch (error) {
      log.error('Failed to get financial overview:', { data: error }, 'financialAnalytics');
      // Return empty structure with zeros instead of throwing
      return [{
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueCount: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        cashFlow: 0,
        budgetUtilization: 0
      }];
    }
  }

  /**
   * Get cash flow trends
   */
  async getCashFlowTrends(months: number = 12): Promise<CashFlowTrend[]> {
    try {
      const dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - months);

      const results = await neonDb
        .select({
          month: sql<string>`DATE_TRUNC('month', ${projects.createdAt})`,
          income: sql<number>`COALESCE(SUM(${sow.paidAmount}), 0)`,
          expenses: sql<number>`COALESCE(SUM(${projects.actualCost}), 0)`,
          netFlow: sql<number>`COALESCE(SUM(${sow.paidAmount}), 0) - COALESCE(SUM(${projects.actualCost}), 0)`,
        })
        .from(projects)
        .leftJoin(sow, eq(projects.id, sow.projectId))
        .where(gte(projects.createdAt, dateFrom))
        .groupBy(sql`DATE_TRUNC('month', ${projects.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${projects.createdAt})`);
        
      return results.map(row => ({
        month: row.month,
        income: row.income || 0,
        expenses: row.expenses || 0,
        netFlow: row.netFlow || 0
      }));
    } catch (error) {
      log.error('Failed to get cash flow trends:', { data: error }, 'financialAnalytics');
      // Return empty array instead of throwing
      return [];
    }
  }
}

// Export singleton instance
export const financialAnalyticsService = new FinancialAnalyticsService();