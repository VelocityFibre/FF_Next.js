// Phase management module exports
export { generateProjectPhases } from './phaseGenerator';
export { 
  getProjectPhases, 
  getPhaseById, 
  updatePhase 
} from './phaseOperations';
export { 
  getPhaseSteps, 
  updateStep 
} from './stepOperations';
export { 
  getStepTasks, 
  createTask, 
  updateTask 
} from './taskOperations';
export { 
  updateProjectProgress, 
  updatePhaseProgress, 
  updateStepProgress 
} from './progressCalculations';