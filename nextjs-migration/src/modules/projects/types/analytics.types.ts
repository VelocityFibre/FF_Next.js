/**
 * Project Analytics Types
 * Types for project metrics and analytics reporting
 */

import { ProjectStatus, ProjectPriority } from './enums';

export interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  
  // Progress metrics
  averageProgress: number;
  projectsOnSchedule: number;
  projectsDelayed: number;
  
  // Budget metrics
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  projectsOverBudget: number;
  
  // Performance metrics
  averageProjectDuration: number; // in days
  onTimeCompletionRate: number; // percentage
  
  // By status breakdown
  statusBreakdown: {
    [K in ProjectStatus]: number;
  };
  
  // By priority breakdown
  priorityBreakdown: {
    [K in ProjectPriority]: number;
  };
}