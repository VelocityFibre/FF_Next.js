/**
 * Staff Analytics Service
 * Handles staff performance analysis and reporting
 */

import { neonDb } from '@/lib/neon/connection';
import { staffPerformance } from '@/lib/neon/schema';
import { eq, and, sum, avg } from 'drizzle-orm';
import type { StaffPerformanceSummary } from './types';

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
}

// Export singleton instance
export const staffAnalyticsService = new StaffAnalyticsService();