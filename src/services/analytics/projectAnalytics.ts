/**
 * Project Analytics Service
 * Handles project performance and trend analysis
 */

import { neonDb } from '@/lib/neon/connection';
import { projects } from '@/lib/neon/schema';
import { eq, and, gte, lte, sql, count, sum, avg } from 'drizzle-orm';
import type { ProjectOverview, ProjectTrend } from './types';

export class ProjectAnalyticsService {
  /**
   * Get project performance overview
   */
  async getProjectOverview(projectId?: string): Promise<ProjectOverview[]> {
    try {
      const baseQuery = neonDb
        .select({
          totalProjects: count(projects.id),
          totalBudget: sum(projects.budget),
          spentBudget: sum(projects.actualCost),
          avgCompletion: avg(projects.progressPercentage),
          activeProjects: sql<number>`COUNT(CASE WHEN ${projects.status} = 'active' THEN 1 END)`,
          completedProjects: sql<number>`COUNT(CASE WHEN ${projects.status} = 'completed' THEN 1 END)`,
          delayedProjects: sql<number>`COUNT(CASE WHEN ${projects.status} = 'active' AND ${projects.endDate} < CURRENT_DATE THEN 1 END)`,
        })
        .from(projects);

      let results;
      if (projectId) {
        results = await baseQuery.where(eq(projects.id, projectId));
      } else {
        results = await baseQuery;
      }

      // Return real data from database with proper fallbacks to 0
      return results.map(row => ({
        totalProjects: row.totalProjects || 0,
        totalBudget: Number(row.totalBudget || 0),
        spentBudget: Number(row.spentBudget || 0),
        avgCompletion: Number(row.avgCompletion || 0),
        activeProjects: row.activeProjects || 0,
        completedProjects: row.completedProjects || 0,
        delayedProjects: row.delayedProjects || 0,
        totalValue: Number(row.totalBudget || 0),
        averageCompletionRate: Number(row.avgCompletion || 0)
      }));
    } catch (error) {
      console.error('Failed to get project overview:', error);
      // Return empty structure with zeros instead of throwing
      return [{
        totalProjects: 0,
        totalBudget: 0,
        spentBudget: 0,
        avgCompletion: 0,
        activeProjects: 0,
        completedProjects: 0,
        delayedProjects: 0,
        totalValue: 0,
        averageCompletionRate: 0
      }];
    }
  }

  /**
   * Get project completion trends over time
   */
  async getProjectTrends(dateFrom: Date, dateTo: Date): Promise<ProjectTrend[]> {
    try {
      const results = await neonDb
        .select({
          month: sql<string>`DATE_TRUNC('month', ${projects.createdAt})`,
          newProjects: sql<number>`COUNT(CASE WHEN ${projects.createdAt} >= DATE_TRUNC('month', ${projects.createdAt}) THEN 1 END)`,
          completedProjects: sql<number>`COUNT(CASE WHEN ${projects.status} = 'completed' THEN 1 END)`,
          activeProjects: sql<number>`COUNT(CASE WHEN ${projects.status} = 'active' THEN 1 END)`,
          avgCompletion: avg(projects.progressPercentage),
          totalBudget: sum(projects.budget),
        })
        .from(projects)
        .where(
          and(
            gte(projects.createdAt, dateFrom),
            lte(projects.createdAt, dateTo)
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${projects.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${projects.createdAt})`);

      // Return real data from database
      return results.map(row => ({
        period: row.month,
        date: row.month,
        month: row.month,
        newProjects: row.newProjects || 0,
        completedProjects: row.completedProjects || 0,
        activeProjects: row.activeProjects || 0,
        avgCompletion: Number(row.avgCompletion || 0),
        totalBudget: Number(row.totalBudget || 0),
        totalValue: Number(row.totalBudget || 0)
      }));
    } catch (error) {
      console.error('Failed to get project trends:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
}

// Export singleton instance
export const projectAnalyticsService = new ProjectAnalyticsService();