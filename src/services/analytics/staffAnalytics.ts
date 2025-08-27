/**
 * Staff Analytics Service
 * Handles staff performance analysis and reporting
 */

import { neonDb } from '@/lib/neon/connection';
import { staffPerformance } from '@/lib/neon/schema';
import { eq, and, sum, avg } from 'drizzle-orm';
import type { StaffPerformanceSummary } from './types';
import { log } from '@/lib/logger';

export class StaffAnalyticsService {
  /**
   * Get staff performance summary
   */
  async getStaffPerformance(
    projectId?: string, 
    periodType: string = 'monthly'
  ): Promise<StaffPerformanceSummary[]> {
    try {
      const conditions = [eq(staffPerformance.periodType, periodType)];
      
      if (projectId) {
        conditions.push(eq(staffPerformance.projectId, projectId));
      }

      const results = await neonDb
        .select({
          staffName: staffPerformance.staffName,
          avgProductivity: avg(staffPerformance.productivity),
          avgQuality: avg(staffPerformance.qualityScore),
          totalHours: sum(staffPerformance.hoursWorked),
          totalTasks: sum(staffPerformance.tasksCompleted),
          avgSafety: avg(staffPerformance.safetyScore),
          avgEfficiency: avg(staffPerformance.efficiency),
        })
        .from(staffPerformance)
        .where(and(...conditions))
        .groupBy(staffPerformance.staffId, staffPerformance.staffName);

      // Transform results to match StaffPerformanceSummary interface
      return results.map(result => ({
        staffName: result.staffName,
        role: 'Staff', // Default role since not in schema
        avgProductivity: Number(result.avgProductivity || 0),
        avgQuality: Number(result.avgQuality || 0),
        totalHours: Number(result.totalHours || 0),
        totalTasks: Number(result.totalTasks || 0),
        attendanceRate: 100, // Default attendance rate
        avgSafety: Number(result.avgSafety || 0),
        avgEfficiency: Number(result.avgEfficiency || 0),
      }));
    } catch (error) {
      log.error('Failed to get staff performance:', { data: error }, 'staffAnalytics');
      throw error;
    }
  }

  /**
   * Get staff performance trends over time
   */
  async getPerformanceTrends(
    staffId: string,
    periodType: string = 'monthly',
    limit: number = 12
  ) {
    try {
      return await neonDb
        .select({
          periodStart: staffPerformance.periodStart,
          periodEnd: staffPerformance.periodEnd,
          productivity: staffPerformance.productivity,
          qualityScore: staffPerformance.qualityScore,
          safetyScore: staffPerformance.safetyScore,
          efficiency: staffPerformance.efficiency,
          hoursWorked: staffPerformance.hoursWorked,
          tasksCompleted: staffPerformance.tasksCompleted,
        })
        .from(staffPerformance)
        .where(and(
          eq(staffPerformance.staffId, staffId),
          eq(staffPerformance.periodType, periodType)
        ))
        .orderBy(staffPerformance.periodStart)
        .limit(limit);
    } catch (error) {
      log.error('Failed to get performance trends:', { data: error }, 'staffAnalytics');
      throw error;
    }
  }

  /**
   * Get top performing staff by metric
   */
  async getTopPerformers(
    metric: 'productivity' | 'quality' | 'safety' | 'efficiency' = 'productivity',
    limit: number = 10,
    projectId?: string,
    periodType: string = 'monthly'
  ) {
    try {
      const conditions = [eq(staffPerformance.periodType, periodType)];
      
      if (projectId) {
        conditions.push(eq(staffPerformance.projectId, projectId));
      }

      const metricColumn = metric === 'productivity' ? staffPerformance.productivity :
                         metric === 'quality' ? staffPerformance.qualityScore :
                         metric === 'efficiency' ? staffPerformance.efficiency :
                         staffPerformance.productivity; // Default fallback
      
      return await neonDb
        .select({
          staffId: staffPerformance.staffId,
          staffName: staffPerformance.staffName,
          avgMetricValue: avg(metricColumn),
          totalHours: sum(staffPerformance.hoursWorked),
          totalTasks: sum(staffPerformance.tasksCompleted),
        })
        .from(staffPerformance)
        .where(and(...conditions))
        .groupBy(staffPerformance.staffId, staffPerformance.staffName)
        .orderBy(avg(metricColumn))
        .limit(limit);
    } catch (error) {
      log.error('Failed to get top performers:', { data: error }, 'staffAnalytics');
      throw error;
    }
  }
}

// Export singleton instance
export const staffAnalyticsService = new StaffAnalyticsService();