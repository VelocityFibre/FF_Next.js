import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { TaskStatus } from '@/types/project.types';
import { getProjectPhases } from './phaseOperations';
import { getPhaseSteps } from './stepOperations';
import { getStepTasks } from './taskOperations';

/**
 * Update project progress based on phase completion
 */
export async function updateProjectProgress(projectId: string): Promise<void> {
  const phases = await getProjectPhases(projectId);
  const totalProgress = phases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
  const avgProgress = phases.length > 0 ? Math.round(totalProgress / phases.length) : 0;
  
  await updateDoc(doc(db, 'projects', projectId), {
    actualProgress: avgProgress,
    updatedAt: serverTimestamp()
  });
}

/**
 * Update phase progress based on step completion
 */
export async function updatePhaseProgress(projectId: string, phaseId: string): Promise<void> {
  const steps = await getPhaseSteps(projectId, phaseId);
  const totalProgress = steps.reduce((sum, step) => sum + (step.progress || 0), 0);
  const avgProgress = steps.length > 0 ? Math.round(totalProgress / steps.length) : 0;
  
  await updateDoc(doc(db, 'projects', projectId, 'phases', phaseId), {
    progress: avgProgress,
    updatedAt: serverTimestamp()
  });
}

/**
 * Update step progress based on task completion
 */
export async function updateStepProgress(projectId: string, phaseId: string, stepId: string): Promise<void> {
  const tasks = await getStepTasks(projectId, phaseId, stepId);
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  await updateDoc(doc(db, 'projects', projectId, 'phases', phaseId, 'steps', stepId), {
    progress,
    updatedAt: serverTimestamp()
  });
}