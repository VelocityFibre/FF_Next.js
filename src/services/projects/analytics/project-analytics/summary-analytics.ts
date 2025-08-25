/**
 * Summary Analytics
 * Core project summary and statistics calculations
 */

import { sql } from '@/lib/neon';
import type { 
  ProjectSummary, 
  ProjectStatusStats, 
  ClientProjectStats,
  AnalyticsQuery
} from './analytics-types';

export class ProjectSummaryAnalytics {
  /**
   * Get project summary statistics
   */
  static async getProjectSummary(query?: AnalyticsQuery): Promise<ProjectSummary> {
    try {
      // Build dynamic conditions using proper SQL fragments
      let conditions = sql`is_active = true`;
      
      if (query?.startDate) {
        conditions = sql`${conditions} AND created_at >= ${query.startDate.toISOString()}`;
      }
      if (query?.endDate) {
        conditions = sql`${conditions} AND created_at <= ${query.endDate.toISOString()}`;
      }
      if (query?.clientId) {
        conditions = sql`${conditions} AND client_id = ${query.clientId}`;
      }
      if (query?.status && query.status.length > 0) {
        conditions = sql`${conditions} AND status = ANY(${query.status})`;
      }
      if (query?.includeInactive) {
        conditions = sql`TRUE`;
      }
      
      const result = await sql`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_projects,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status = 'ON_HOLD' THEN 1 END) as on_hold_projects,
          AVG(progress) as avg_progress
        FROM projects
        WHERE ${conditions}
      `;
      
      return {
        totalProjects: parseInt(result[0].total_projects),
        activeProjects: parseInt(result[0].active_projects),
        completedProjects: parseInt(result[0].completed_projects),
        onHoldProjects: parseInt(result[0].on_hold_projects),
        averageProgress: parseFloat(result[0].avg_progress) || 0
      };
    } catch (error) {
      console.error('Error fetching project summary:', error);
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        onHoldProjects: 0,
        averageProgress: 0
      };
    }
  }

  /**
   * Get project statistics by status
   */
  static async getProjectsByStatus(query?: AnalyticsQuery): Promise<ProjectStatusStats[]> {
    try {
      // Build dynamic conditions using proper SQL fragments
      let conditions = sql`is_active = true`;
      
      if (query?.startDate) {
        conditions = sql`${conditions} AND created_at >= ${query.startDate.toISOString()}`;
      }
      if (query?.endDate) {
        conditions = sql`${conditions} AND created_at <= ${query.endDate.toISOString()}`;
      }
      if (query?.clientId) {
        conditions = sql`${conditions} AND client_id = ${query.clientId}`;
      }
      if (query?.status && query.status.length > 0) {
        conditions = sql`${conditions} AND status = ANY(${query.status})`;
      }
      if (query?.includeInactive) {
        conditions = sql`TRUE`;
      }
      
      const result = await sql`
        SELECT status, COUNT(*) as count
        FROM projects
        WHERE ${conditions}
        GROUP BY status
        ORDER BY count DESC
      `;
      
      return result.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      }));
    } catch (error) {
      console.error('Error fetching projects by status:', error);
      return [];
    }
  }

  /**
   * Get project statistics by client
   */
  static async getProjectsByClient(query?: AnalyticsQuery): Promise<ClientProjectStats[]> {
    try {
      // Build dynamic conditions for the project filter
      let projectConditions = sql`p.is_active = true`;
      
      if (query?.startDate) {
        projectConditions = sql`${projectConditions} AND p.created_at >= ${query.startDate.toISOString()}`;
      }
      if (query?.endDate) {
        projectConditions = sql`${projectConditions} AND p.created_at <= ${query.endDate.toISOString()}`;
      }
      if (query?.clientId) {
        projectConditions = sql`${projectConditions} AND p.client_id = ${query.clientId}`;
      }
      if (query?.status && query.status.length > 0) {
        projectConditions = sql`${projectConditions} AND p.status = ANY(${query.status})`;
      }
      if (query?.includeInactive) {
        projectConditions = sql`TRUE`;
      }
      
      const result = await sql`
        SELECT 
          c.id as client_id,
          c.name as client_name,
          COUNT(p.id) as project_count,
          COALESCE(SUM(p.budget), 0) as total_budget
        FROM clients c
        LEFT JOIN projects p ON c.id = p.client_id AND ${projectConditions}
        GROUP BY c.id, c.name
        HAVING COUNT(p.id) > 0
        ORDER BY project_count DESC
      `;
      
      return result.map(row => ({
        clientId: row.client_id,
        clientName: row.client_name,
        projectCount: parseInt(row.project_count),
        totalBudget: parseFloat(row.total_budget) || 0
      }));
    } catch (error) {
      console.error('Error fetching projects by client:', error);
      return [];
    }
  }

  /**
   * Get top performing clients by various metrics
   */
  static async getTopClients(limit: number = 10): Promise<Array<{
    clientId: string;
    clientName: string;
    metrics: {
      projectCount: number;
      totalBudget: number;
      avgProjectValue: number;
      completionRate: number;
    };
  }>> {
    try {
      const result = await sql`
        SELECT 
          c.id as client_id,
          c.name as client_name,
          COUNT(p.id) as project_count,
          COALESCE(SUM(p.budget), 0) as total_budget,
          COALESCE(AVG(p.budget), 0) as avg_project_value,
          COALESCE(
            COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END)::float / 
            NULLIF(COUNT(p.id), 0) * 100, 
            0
          ) as completion_rate
        FROM clients c
        LEFT JOIN projects p ON c.id = p.client_id AND p.is_active = true
        GROUP BY c.id, c.name
        HAVING COUNT(p.id) > 0
        ORDER BY total_budget DESC
        LIMIT ${limit}
      `;
      
      return result.map(row => ({
        clientId: row.client_id,
        clientName: row.client_name,
        metrics: {
          projectCount: parseInt(row.project_count),
          totalBudget: parseFloat(row.total_budget),
          avgProjectValue: parseFloat(row.avg_project_value),
          completionRate: parseFloat(row.completion_rate)
        }
      }));
    } catch (error) {
      console.error('Error fetching top clients:', error);
      return [];
    }
  }

  /**
   * Get project distribution by various dimensions
   */
  static async getProjectDistribution(): Promise<{
    byStatus: ProjectStatusStats[];
    byType: Array<{ type: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
  }> {
    try {
      const [statusResult, typeResult, priorityResult] = await Promise.all([
        this.getProjectsByStatus(),
        sql`
          SELECT 
            COALESCE(type, 'Unknown') as type, 
            COUNT(*) as count
          FROM projects
          WHERE is_active = true
          GROUP BY type
          ORDER BY count DESC
        `,
        sql`
          SELECT 
            COALESCE(priority, 'Medium') as priority, 
            COUNT(*) as count
          FROM projects
          WHERE is_active = true
          GROUP BY priority
          ORDER BY count DESC
        `
      ]);

      return {
        byStatus: statusResult,
        byType: typeResult.map(row => ({
          type: row.type,
          count: parseInt(row.count)
        })),
        byPriority: priorityResult.map(row => ({
          priority: row.priority,
          count: parseInt(row.count)
        }))
      };
    } catch (error) {
      console.error('Error fetching project distribution:', error);
      return {
        byStatus: [],
        byType: [],
        byPriority: []
      };
    }
  }


  /**
   * Calculate growth rate between two periods
   */
  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get summary statistics with period comparison
   */
  static async getSummaryWithComparison(): Promise<{
    current: ProjectSummary;
    previous: ProjectSummary;
    growth: {
      totalProjects: number;
      activeProjects: number;
      completedProjects: number;
      averageProgress: number;
    };
  }> {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [current, previous] = await Promise.all([
      this.getProjectSummary({ startDate: thirtyDaysAgo }),
      this.getProjectSummary({ startDate: sixtyDaysAgo, endDate: thirtyDaysAgo })
    ]);

    return {
      current,
      previous,
      growth: {
        totalProjects: this.calculateGrowthRate(current.totalProjects, previous.totalProjects),
        activeProjects: this.calculateGrowthRate(current.activeProjects, previous.activeProjects),
        completedProjects: this.calculateGrowthRate(current.completedProjects, previous.completedProjects),
        averageProgress: this.calculateGrowthRate(current.averageProgress, previous.averageProgress)
      }
    };
  }
}