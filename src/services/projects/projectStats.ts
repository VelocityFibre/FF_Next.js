import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { log } from '@/lib/logger';
import { 
  Project,
  ProjectSummary,
  ProjectStatus
} from '@/types/project.types';

/**
 * Get project statistics summary
 */
export async function getProjectSummary(): Promise<ProjectSummary> {
  try {
    const projectsRef = collection(db, 'projects');
    
    // Get all projects for counting
    const allSnapshot = await getDocs(projectsRef);
    const total = allSnapshot.size;
    
    // Count by status
    const activeQuery = query(projectsRef, where('status', '==', ProjectStatus.ACTIVE));
    const activeSnapshot = await getDocs(activeQuery);
    const active = activeSnapshot.size;
    
    const completedQuery = query(projectsRef, where('status', '==', ProjectStatus.COMPLETED));
    const completedSnapshot = await getDocs(completedQuery);
    const completed = completedSnapshot.size;
    
    const onHoldQuery = query(projectsRef, where('status', '==', ProjectStatus.ON_HOLD));
    const onHoldSnapshot = await getDocs(onHoldQuery);
    const onHold = onHoldSnapshot.size;
    
    // Calculate totals
    let totalBudget = 0;
    let totalSpent = 0;
    
    allSnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalBudget += data.budget || 0;
      totalSpent += data.actualCost || 0;
    });
    
    return {
      total,
      active,
      completed,
      onHold,
      totalBudget,
      totalSpent,
      averageProgress: calculateAverageProgress(allSnapshot.docs.map(doc => doc.data() as Project))
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
    const q = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
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
    const now = new Date();
    const activeQuery = query(
      collection(db, 'projects'),
      where('status', '==', ProjectStatus.ACTIVE)
    );
    
    const snapshot = await getDocs(activeQuery);
    const projects = snapshot.docs.map(doc => ({
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