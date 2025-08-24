/**
 * @deprecated This file has been modularized for better maintainability.
 * Import from './phases/' directory instead.
 * This file maintained for backward compatibility.
 */

// Re-export all functions from modular structure
export {
  generateProjectPhases,
  getProjectPhases,
  getPhaseById,
  updatePhase,
  getPhaseSteps,
  updateStep,
  getStepTasks,
  createTask,
  updateTask,
  updateProjectProgress,
  updatePhaseProgress,
  updateStepProgress
} from './phases';