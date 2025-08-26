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

      let results;
      if (conditions.length > 0) {
        results = await baseQuery.where(and(...conditions));
      } else {
        results = await baseQuery;
      }

      // Transform results to ensure proper types
      return results.map(row => ({
        metricType: row.metricType,
        metricName: row.metricName,
        currentValue: Number(row.currentValue || 0),
        unit: row.unit || '',
        recordCount: row.recordCount
      }));
    } catch (error) {
      console.error('Failed to get KPI dashboard:', error);
      // Return empty array instead of throwing
      return [];
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

      const results = await neonDb
        .select({
          date: sql<string>`DATE(${kpiMetrics.recordedDate})`,
          value: avg(kpiMetrics.metricValue),
          count: count(kpiMetrics.id),
        })
        .from(kpiMetrics)
        .where(and(...conditions))
        .groupBy(sql`DATE(${kpiMetrics.recordedDate})`)
        .orderBy(sql`DATE(${kpiMetrics.recordedDate})`);

      return results.map(row => ({
        date: row.date,
        value: Number(row.value || 0),
        count: row.count
      }));
    } catch (error) {
      console.error('Failed to get KPI trends:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
}

// Export singleton instance
export const kpiAnalyticsService = new KPIAnalyticsService();