/**
 * Trend Analytics
 * Time-based trends and timeline analysis
 */

import { sql } from '@/lib/neon';
import type { 
  MonthlyTrend, 
  BudgetAnalysis, 
  TimelineData,
  AnalyticsQuery
} from './analytics-types';

export class ProjectTrendAnalytics {
  /**
   * Get monthly project completion trends
   */
  static async getMonthlyCompletionTrends(months: number = 12): Promise<MonthlyTrend[]> {
    try {
      const result = await sql`
        WITH months AS (
          SELECT 
            DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${months} months' + INTERVAL (i || ' months')) as month
          FROM generate_series(0, ${months - 1}) as i
        )
        SELECT 
          TO_CHAR(m.month, 'YYYY-MM') as month,
          COALESCE(completed.count, 0) as completed,
          COALESCE(started.count, 0) as started
        FROM months m
        LEFT JOIN (
          SELECT 
            DATE_TRUNC('month', updated_at) as month,
            COUNT(*) as count
          FROM projects
          WHERE status = 'COMPLETED' AND is_active = true
          GROUP BY DATE_TRUNC('month', updated_at)
        ) completed ON m.month = completed.month
        LEFT JOIN (
          SELECT 
            DATE_TRUNC('month', start_date) as month,
            COUNT(*) as count
          FROM projects
          WHERE start_date IS NOT NULL AND is_active = true
          GROUP BY DATE_TRUNC('month', start_date)
        ) started ON m.month = started.month
        ORDER BY m.month
      `;
      
      return result.map(row => ({
        month: row.month,
        completed: parseInt(row.completed) || 0,
        started: parseInt(row.started) || 0
      }));
    } catch (error) {
      console.error('Error fetching monthly completion trends:', error);
      return [];
    }
  }

  /**
   * Get budget analysis and trends
   */
  static async getBudgetAnalysis(query?: AnalyticsQuery): Promise<BudgetAnalysis> {
    try {
      const whereClause = query ? this.buildWhereClause(query) : 'is_active = true';
      
      const summaryResult = await sql`
        SELECT 
          COALESCE(SUM(budget), 0) as total_budget,
          COALESCE(AVG(budget), 0) as average_budget
        FROM projects
        WHERE (${whereClause}) AND budget IS NOT NULL
      `;
      
      const statusResult = await sql`
        SELECT 
          status,
          COALESCE(SUM(budget), 0) as total_budget
        FROM projects
        WHERE (${whereClause}) AND budget IS NOT NULL
        GROUP BY status
        ORDER BY total_budget DESC
      `;
      
      return {
        totalBudget: parseFloat(summaryResult[0].total_budget) || 0,
        averageBudget: parseFloat(summaryResult[0].average_budget) || 0,
        budgetByStatus: statusResult.map(row => ({
          status: row.status,
          totalBudget: parseFloat(row.total_budget) || 0
        }))
      };
    } catch (error) {
      console.error('Error fetching budget analysis:', error);
      return {
        totalBudget: 0,
        averageBudget: 0,
        budgetByStatus: []
      };
    }
  }

  /**
   * Get project timeline analysis
   */
  static async getProjectTimeline(weeksAhead: number = 52): Promise<TimelineData[]> {
    try {
      const result = await sql`
        WITH dates AS (
          SELECT generate_series(
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '${weeksAhead} weeks',
            INTERVAL '1 week'
          )::date as date
        )
        SELECT 
          d.date::text as date,
          COALESCE(starting.count, 0) as projects_starting,
          COALESCE(ending.count, 0) as projects_ending,
          COALESCE(milestones.count, 0) as milestones
        FROM dates d
        LEFT JOIN (
          SELECT start_date::date as date, COUNT(*) as count
          FROM projects
          WHERE start_date IS NOT NULL AND is_active = true
          GROUP BY start_date::date
        ) starting ON d.date = starting.date
        LEFT JOIN (
          SELECT end_date::date as date, COUNT(*) as count
          FROM projects
          WHERE end_date IS NOT NULL AND is_active = true
          GROUP BY end_date::date
        ) ending ON d.date = ending.date
        LEFT JOIN (
          SELECT milestone_date::date as date, COUNT(*) as count
          FROM project_milestones pm
          JOIN projects p ON pm.project_id = p.id
          WHERE milestone_date IS NOT NULL AND p.is_active = true
          GROUP BY milestone_date::date
        ) milestones ON d.date = milestones.date
        ORDER BY d.date
        LIMIT ${weeksAhead}
      `;
      
      return result.map(row => ({
        date: row.date,
        projectsStarting: parseInt(row.projects_starting) || 0,
        projectsEnding: parseInt(row.projects_ending) || 0,
        milestones: parseInt(row.milestones) || 0
      }));
    } catch (error) {
      console.error('Error fetching project timeline:', error);
      return [];
    }
  }

  /**
   * Get quarterly trends
   */
  static async getQuarterlyTrends(quarters: number = 4): Promise<Array<{
    quarter: string;
    projectsCompleted: number;
    totalBudget: number;
    averageProgress: number;
    clientCount: number;
  }>> {
    try {
      const result = await sql`
        WITH quarters AS (
          SELECT 
            DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '${quarters * 3} months' + INTERVAL (i * 3 || ' months')) as quarter_start,
            DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '${quarters * 3} months' + INTERVAL ((i * 3 + 3) || ' months')) - INTERVAL '1 day' as quarter_end
          FROM generate_series(0, ${quarters - 1}) as i
        )
        SELECT 
          TO_CHAR(q.quarter_start, 'YYYY') || ' Q' || EXTRACT(quarter FROM q.quarter_start) as quarter,
          COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as projects_completed,
          COALESCE(SUM(p.budget), 0) as total_budget,
          COALESCE(AVG(p.progress), 0) as average_progress,
          COUNT(DISTINCT p.client_id) as client_count
        FROM quarters q
        LEFT JOIN projects p ON p.created_at >= q.quarter_start 
          AND p.created_at <= q.quarter_end 
          AND p.is_active = true
        GROUP BY q.quarter_start
        ORDER BY q.quarter_start
      `;
      
      return result.map(row => ({
        quarter: row.quarter,
        projectsCompleted: parseInt(row.projects_completed) || 0,
        totalBudget: parseFloat(row.total_budget) || 0,
        averageProgress: parseFloat(row.average_progress) || 0,
        clientCount: parseInt(row.client_count) || 0
      }));
    } catch (error) {
      console.error('Error fetching quarterly trends:', error);
      return [];
    }
  }

  /**
   * Get year-over-year comparison
   */
  static async getYearOverYearComparison(): Promise<{
    currentYear: {
      projects: number;
      budget: number;
      completed: number;
    };
    previousYear: {
      projects: number;
      budget: number;
      completed: number;
    };
    growth: {
      projects: number;
      budget: number;
      completed: number;
    };
  }> {
    try {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;

      const [currentResult, previousResult] = await Promise.all([
        sql`
          SELECT 
            COUNT(*) as projects,
            COALESCE(SUM(budget), 0) as budget,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
          FROM projects
          WHERE EXTRACT(year FROM created_at) = ${currentYear} AND is_active = true
        `,
        sql`
          SELECT 
            COUNT(*) as projects,
            COALESCE(SUM(budget), 0) as budget,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
          FROM projects
          WHERE EXTRACT(year FROM created_at) = ${previousYear} AND is_active = true
        `
      ]);

      const current = {
        projects: parseInt(currentResult[0].projects),
        budget: parseFloat(currentResult[0].budget),
        completed: parseInt(currentResult[0].completed)
      };

      const previous = {
        projects: parseInt(previousResult[0].projects),
        budget: parseFloat(previousResult[0].budget),
        completed: parseInt(previousResult[0].completed)
      };

      return {
        currentYear: current,
        previousYear: previous,
        growth: {
          projects: this.calculateGrowthRate(current.projects, previous.projects),
          budget: this.calculateGrowthRate(current.budget, previous.budget),
          completed: this.calculateGrowthRate(current.completed, previous.completed)
        }
      };
    } catch (error) {
      console.error('Error fetching year-over-year comparison:', error);
      return {
        currentYear: { projects: 0, budget: 0, completed: 0 },
        previousYear: { projects: 0, budget: 0, completed: 0 },
        growth: { projects: 0, budget: 0, completed: 0 }
      };
    }
  }

  /**
   * Get seasonal trends
   */
  static async getSeasonalTrends(): Promise<Array<{
    season: string;
    avgProjects: number;
    avgBudget: number;
    completionRate: number;
  }>> {
    try {
      const result = await sql`
        SELECT 
          CASE 
            WHEN EXTRACT(month FROM created_at) IN (12, 1, 2) THEN 'Winter'
            WHEN EXTRACT(month FROM created_at) IN (3, 4, 5) THEN 'Spring'
            WHEN EXTRACT(month FROM created_at) IN (6, 7, 8) THEN 'Summer'
            ELSE 'Fall'
          END as season,
          COUNT(*) / COUNT(DISTINCT EXTRACT(year FROM created_at)) as avg_projects,
          COALESCE(AVG(budget), 0) as avg_budget,
          (COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::float / COUNT(*)) * 100 as completion_rate
        FROM projects
        WHERE is_active = true AND created_at >= CURRENT_DATE - INTERVAL '3 years'
        GROUP BY 
          CASE 
            WHEN EXTRACT(month FROM created_at) IN (12, 1, 2) THEN 'Winter'
            WHEN EXTRACT(month FROM created_at) IN (3, 4, 5) THEN 'Spring'
            WHEN EXTRACT(month FROM created_at) IN (6, 7, 8) THEN 'Summer'
            ELSE 'Fall'
          END
        ORDER BY 
          CASE 
            WHEN CASE 
              WHEN EXTRACT(month FROM created_at) IN (12, 1, 2) THEN 'Winter'
              WHEN EXTRACT(month FROM created_at) IN (3, 4, 5) THEN 'Spring'
              WHEN EXTRACT(month FROM created_at) IN (6, 7, 8) THEN 'Summer'
              ELSE 'Fall'
            END = 'Spring' THEN 1
            WHEN CASE 
              WHEN EXTRACT(month FROM created_at) IN (12, 1, 2) THEN 'Winter'
              WHEN EXTRACT(month FROM created_at) IN (3, 4, 5) THEN 'Spring'
              WHEN EXTRACT(month FROM created_at) IN (6, 7, 8) THEN 'Summer'
              ELSE 'Fall'
            END = 'Summer' THEN 2
            WHEN CASE 
              WHEN EXTRACT(month FROM created_at) IN (12, 1, 2) THEN 'Winter'
              WHEN EXTRACT(month FROM created_at) IN (3, 4, 5) THEN 'Spring'
              WHEN EXTRACT(month FROM created_at) IN (6, 7, 8) THEN 'Summer'
              ELSE 'Fall'
            END = 'Fall' THEN 3
            ELSE 4
          END
      `;
      
      return result.map(row => ({
        season: row.season,
        avgProjects: parseInt(row.avg_projects) || 0,
        avgBudget: parseFloat(row.avg_budget) || 0,
        completionRate: parseFloat(row.completion_rate) || 0
      }));
    } catch (error) {
      console.error('Error fetching seasonal trends:', error);
      return [];
    }
  }

  /**
   * Calculate growth rate between two values
   */
  private static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  /**
   * Build WHERE clause for filtering
   */
  private static buildWhereClause(query: AnalyticsQuery): string {
    const conditions = ['is_active = true'];

    if (query.startDate) {
      conditions.push(`created_at >= '${query.startDate.toISOString()}'`);
    }
    if (query.endDate) {
      conditions.push(`created_at <= '${query.endDate.toISOString()}'`);
    }
    if (query.clientId) {
      conditions.push(`client_id = '${query.clientId}'`);
    }
    if (query.status && query.status.length > 0) {
      const statusList = query.status.map(s => `'${s}'`).join(',');
      conditions.push(`status IN (${statusList})`);
    }
    if (query.includeInactive) {
      conditions[0] = 'TRUE'; // Remove is_active filter
    }

    return conditions.join(' AND ');
  }
}