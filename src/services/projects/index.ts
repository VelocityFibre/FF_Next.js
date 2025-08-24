/**
 * Project Service - Main export file
 */

// CRUD operations
export {
  getAll,
  getById,
  create,
  update,
  remove,
  getByClientId,
  getActiveProjects
} from './projectCrud';

// Phases and hierarchy management
export {
  generateProjectPhases,
  getProjectPhases,
  getPhaseById,
  updatePhase,
  getPhaseSteps,
  updateStep,
  getStepTasks,
  createTask,
  updateTask
} from './projectPhases';

// Statistics and analytics
export {
  getProjectSummary,
  getRecentProjects,
  getOverdueProjects,
  getProjectsByStatus,
  getProjectCountByType,
  getProjectsEndingSoon,
  calculateBudgetVariance
} from './projectStats';

// Real-time subscriptions
export {
  subscribeToProject,
  subscribeToProjects,
  subscribeToProjectPhases,
  subscribeToPhaseSteps,
  subscribeToStepTasks,
  subscribeToProjectHierarchy,
  unsubscribeAll
} from './projectRealtime';

// Create the projectService object for backward compatibility
import * as crud from './projectCrud';
import * as phases from './projectPhases';
import * as stats from './projectStats';
import * as realtime from './projectRealtime';

export const projectService = {
  // CRUD operations
  getAll: crud.getAll,
  getById: crud.getById,
  create: crud.create,
  update: crud.update,
  delete: crud.remove,
  remove: crud.remove,
  getByClientId: crud.getByClientId,
  getActiveProjects: crud.getActiveProjects,
  
  // Phases
  generatePhases: phases.generateProjectPhases,
  getPhases: phases.getProjectPhases,
  getPhase: phases.getPhaseById,
  updatePhase: phases.updatePhase,
  getSteps: phases.getPhaseSteps,
  updateStep: phases.updateStep,
  getTasks: phases.getStepTasks,
  createTask: phases.createTask,
  updateTask: phases.updateTask,
  initializeProjectPhases: phases.generateProjectPhases, // Alias
  
  // Stats
  getSummary: stats.getProjectSummary,
  getRecent: stats.getRecentProjects,
  getOverdue: stats.getOverdueProjects,
  getByStatus: stats.getProjectsByStatus,
  getCountByType: stats.getProjectCountByType,
  getEndingSoon: stats.getProjectsEndingSoon,
  calculateBudgetVariance: stats.calculateBudgetVariance,
  getProjectSummary: stats.getProjectSummary, // Direct export
  getProjectHierarchy: realtime.subscribeToProjectHierarchy, // Alias
  
  // Real-time
  subscribe: realtime.subscribeToProject,
  subscribeToList: realtime.subscribeToProjects,
  subscribeToPhases: realtime.subscribeToProjectPhases,
  subscribeToSteps: realtime.subscribeToPhaseSteps,
  subscribeToTasks: realtime.subscribeToStepTasks,
  subscribeToHierarchy: realtime.subscribeToProjectHierarchy,
  unsubscribeAll: realtime.unsubscribeAll,
  subscribeToProject: realtime.subscribeToProject, // Direct export
  subscribeToProjects: realtime.subscribeToProjects // Direct export
};