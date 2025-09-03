/**
 * Project Progress Types
 * Types for project progress tracking and phase management
 */

/**
 * Project Progress Types
 * Types for project progress tracking and phase management
 * Note: Main interfaces are defined in core.types.ts to avoid circular imports
 */

// Re-export from core types to maintain module organization
export type {
  ProjectProgress,
  ProjectPhase,
  PhaseTask,
  ProjectMilestone,
  ProjectRisk,
  ProjectUpdate
} from './core.types';