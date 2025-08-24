/**
 * Financial Analytics Service
 * Handles financial reporting and cash flow analysis
 */

import { neonDb } from '@/lib/neon/connection';
import { financialTransactions } from '@/lib/neon/schema';
import { eq, gte, sql, count, sum } from 'drizzle-orm';
import type { FinancialOverview, CashFlowTrend } from './types';

export class FinancialAnalyticsService {
  /**
   * Get financial overview
   */
  async getFinancialOverview(projectId?: string): Promise<FinancialOverview[]> {
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
  async getCashFlowTrends(months: number = 12): Promise<CashFlowTrend[]> {
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
}

// Export singleton instance
export const financialAnalyticsService = new FinancialAnalyticsService();