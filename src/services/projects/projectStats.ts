/**
 * Project Statistics Service - Migrated to Neon PostgreSQL
 */

import { neon } from '@neondatabase/serverless';
import { log } from '@/lib/logger';
import { 
  Project,
  ProjectSummary,
  ProjectStatus
} from '@/types/project.types';
import { progressCalculations } from './phases/neonPhaseService';

// Get database connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);

/**
 * Get project statistics summary
 */
export async function getProjectSummary(): Promise<ProjectSummary> {
  try {
    // Get project statistics from Neon
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = ${ProjectStatus.ACTIVE} THEN 1 END) as active,
        COUNT(CASE WHEN status = ${ProjectStatus.COMPLETED} THEN 1 END) as completed,
        COUNT(CASE WHEN status = ${ProjectStatus.ON_HOLD} THEN 1 END) as on_hold,
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(actual_cost), 0) as total_spent,
        COALESCE(AVG(progress), 0) as average_progress
      FROM projects
    `;
    
    const stats = statsResult[0];
    
    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      completed: parseInt(stats.completed),
      onHold: parseInt(stats.on_hold),
      totalBudget: parseFloat(stats.total_budget),
      totalSpent: parseFloat(stats.total_spent),
      averageProgress: parseFloat(stats.average_progress)
    };
  } catch (error) {
    log.error('Error getting project summary:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch project summary');
  }
}

/**
 * Get recent projects
 */
export async function getRecentProjects(count: number = 5): Promise<Project[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        client_id as "clientId",
        status,
        start_date as "startDate",
        end_date as "endDate",
        budget,
        actual_cost as "actualCost",
        progress,
        description,
        project_manager as "projectManager",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM projects
      ORDER BY created_at DESC
      LIMIT ${count}
    `;
    
    return result as Project[];
  } catch (error) {
    log.error('Error getting recent projects:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch recent projects');
  }
}

/**
 * Get overdue projects
 */
export async function getOverdueProjects(): Promise<Project[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        client_id as "clientId",
        status,
        start_date as "startDate",
        end_date as "endDate",
        budget,
        actual_cost as "actualCost",
        progress,
        description,
        project_manager as "projectManager",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM projects
      WHERE status = ${ProjectStatus.ACTIVE}
        AND end_date < CURRENT_DATE
      ORDER BY end_date ASC
    `;
    
    return result as Project[];
  } catch (error) {
    log.error('Error getting overdue projects:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch overdue projects');
  }
}

/**
 * Get project statistics with phase breakdown
 */
export async function getProjectStatisticsWithPhases(projectId: string) {
  try {
    // Get project basic info
    const projectResult = await sql`
      SELECT 
        id,
        name,
        status,
        progress,
        budget,
        actual_cost as "actualCost",
        start_date as "startDate",
        end_date as "endDate"
      FROM projects
      WHERE id = ${projectId}::uuid
    `;
    
    if (projectResult.length === 0) {
      throw new Error('Project not found');
    }
    
    const project = projectResult[0];
    
    // Get phase statistics
    const phaseStats = await progressCalculations.getProjectProgressSummary(projectId);
    
    // Get phase breakdown
    const phasesResult = await sql`
      SELECT 
        id,
        name,
        phase_type as type,
        status,
        progress,
        budget,
        actual_cost as "actualCost",
        planned_start_date as "plannedStartDate",
        planned_end_date as "plannedEndDate",
        actual_start_date as "actualStartDate",
        actual_end_date as "actualEndDate"
      FROM project_phases
      WHERE project_id = ${projectId}::uuid
      ORDER BY phase_order ASC
    `;
    
    return {
      project,
      statistics: phaseStats,
      phases: phasesResult
    };
  } catch (error) {
    log.error('Error getting project statistics with phases:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch project statistics');
  }
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        client_id as "clientId",
        status,
        start_date as "startDate",
        end_date as "endDate",
        budget,
        actual_cost as "actualCost",
        progress,
        description,
        project_manager as "projectManager",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM projects
      WHERE status = ${status}
      ORDER BY created_at DESC
    `;
    
    return result as Project[];
  } catch (error) {
    log.error('Error getting projects by status:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch projects by status');
  }
}

/**
 * Calculate project health score
 */
export async function calculateProjectHealthScore(projectId: string): Promise<number> {
  try {
    const statsResult = await sql`
      SELECT 
        p.progress,
        p.budget,
        p.actual_cost as actual_cost,
        p.end_date as end_date,
        COUNT(DISTINCT ph.id) as total_phases,
        COUNT(DISTINCT CASE WHEN ph.status = 'completed' THEN ph.id END) as completed_phases,
        COUNT(DISTINCT CASE WHEN ph.status = 'blocked' THEN ph.id END) as blocked_phases,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
        COUNT(DISTINCT CASE WHEN t.is_blocked = true THEN t.id END) as blocked_tasks
      FROM projects p
      LEFT JOIN project_phases ph ON ph.project_id = p.id
      LEFT JOIN phase_tasks t ON t.project_id = p.id
      WHERE p.id = ${projectId}::uuid
      GROUP BY p.id, p.progress, p.budget, p.actual_cost, p.end_date
    `;
    
    if (statsResult.length === 0) {
      throw new Error('Project not found');
    }
    
    const stats = statsResult[0];
    let healthScore = 100;
    
    // Deduct points for budget overrun
    if (stats.actual_cost > stats.budget) {
      const overrunPercent = ((stats.actual_cost - stats.budget) / stats.budget) * 100;
      healthScore -= Math.min(overrunPercent, 30); // Max 30 point deduction
    }
    
    // Deduct points for being overdue
    if (stats.end_date && new Date(stats.end_date) < new Date()) {
      healthScore -= 20;
    }
    
    // Deduct points for blocked phases/tasks
    if (stats.total_phases > 0) {
      const blockedPercent = (stats.blocked_phases / stats.total_phases) * 100;
      healthScore -= Math.min(blockedPercent * 0.5, 20); // Max 20 point deduction
    }
    
    if (stats.total_tasks > 0) {
      const blockedTaskPercent = (stats.blocked_tasks / stats.total_tasks) * 100;
      healthScore -= Math.min(blockedTaskPercent * 0.3, 15); // Max 15 point deduction
    }
    
    // Add points for good progress
    if (stats.progress > 75) {
      healthScore += 10;
    }
    
    return Math.max(0, Math.min(100, healthScore));
  } catch (error) {
    log.error('Error calculating project health score:', { data: error }, 'projectStats');
    throw new Error('Failed to calculate project health score');
  }
}

// Keep the original function for backward compatibility
function calculateAverageProgress(projects: Project[]): number {
  if (projects.length === 0) return 0;
  const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
  return totalProgress / projects.length;
      id: doc.id,
      ...doc.data()
    } as Project));
    
    // Filter overdue projects
    return projects.filter(project => {
      if (!project.endDate) return false;
      let endDate: Date;
      if (project.endDate instanceof Date) {
        endDate = project.endDate;
      } else if (typeof project.endDate === 'object' && 'toDate' in project.endDate) {
        endDate = (project.endDate as any).toDate();
      } else {
        endDate = new Date(project.endDate as string);
      }
      return endDate < now && project.actualProgress < 100;
    });
  } catch (error) {
    log.error('Error getting overdue projects:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch overdue projects');
  }
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('status', '==', status),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  } catch (error) {
    log.error('Error getting projects by status:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch projects by status');
  }
}

/**
 * Get project count by type
 */
export async function getProjectCountByType(): Promise<Record<string, number>> {
  try {
    const snapshot = await getDocs(collection(db, 'projects'));
    const counts: Record<string, number> = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const type = data.projectType || 'other';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    return counts;
  } catch (error) {
    log.error('Error getting project counts by type:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch project counts');
  }
}

/**
 * Get projects ending soon (within next 7 days)
 */
export async function getProjectsEndingSoon(): Promise<Project[]> {
  try {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const activeQuery = query(
      collection(db, 'projects'),
      where('status', '==', ProjectStatus.ACTIVE)
    );
    
    const snapshot = await getDocs(activeQuery);
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
    
    // Filter projects ending within 7 days
    return projects.filter(project => {
      if (!project.endDate) return false;
      let endDate: Date;
      if (project.endDate instanceof Date) {
        endDate = project.endDate;
      } else if (typeof project.endDate === 'object' && 'toDate' in project.endDate) {
        endDate = (project.endDate as any).toDate();
      } else {
        endDate = new Date(project.endDate as string);
      }
      return endDate >= now && endDate <= weekFromNow;
    });
  } catch (error) {
    log.error('Error getting projects ending soon:', { data: error }, 'projectStats');
    throw new Error('Failed to fetch projects ending soon');
  }
}

/**
 * Calculate budget variance for all projects
 */
export async function calculateBudgetVariance(): Promise<{
  overBudget: number;
  underBudget: number;
  onBudget: number;
  totalVariance: number;
}> {
  try {
    const snapshot = await getDocs(collection(db, 'projects'));
    
    let overBudget = 0;
    let underBudget = 0;
    let onBudget = 0;
    let totalVariance = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.budget && data.actualCost !== undefined) {
        const variance = data.actualCost - data.budget;
        totalVariance += variance;
        
        if (variance > 0) {
          overBudget++;
        } else if (variance < 0) {
          underBudget++;
        } else {
          onBudget++;
        }
      }
    });
    
    return {
      overBudget,
      underBudget,
      onBudget,
      totalVariance
    };
  } catch (error) {
    log.error('Error calculating budget variance:', { data: error }, 'projectStats');
    throw new Error('Failed to calculate budget variance');
  }
}

// Helper functions
function calculateAverageProgress(projects: Project[]): number {
  if (projects.length === 0) return 0;
  
  const totalProgress = projects.reduce((sum, project) => {
    return sum + (project.actualProgress || 0);
  }, 0);
  
  return Math.round(totalProgress / projects.length);
}