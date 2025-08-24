/**
 * KPI Analytics Service
 * Handles Key Performance Indicator metrics and trends
 */

import { neonDb } from '@/lib/neon/connection';
import { kpiMetrics } from '@/lib/neon/schema';
import { eq, and, gte, lte, sql, count, avg } from 'drizzle-orm';
import type { KPIDashboardItem, KPITrend } from './types';

export class KPIAnalyticsService {
  /**
   * Get KPI metrics for dashboard
   */
  async getKPIDashboard(
    projectId?: string, 
    dateFrom?: Date, 
    dateTo?: Date
  ): Promise<KPIDashboardItem[]> {
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
  async getKPITrends(
    metricType: string, 
    projectId?: string, 
    days: number = 30
  ): Promise<KPITrend[]> {
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
}

// Export singleton instance
export const kpiAnalyticsService = new KPIAnalyticsService();