import { 
  collection, 
  doc, 
  addDoc,
  getDocs, 
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/src/config/firebase';
import { Task, TaskStatus } from '@/types/project.types';
import { updateStepProgress, updatePhaseProgress, updateProjectProgress } from './progressCalculations';
import { log } from '@/lib/logger';

/**
 * Get all tasks for a step
 */
export async function getStepTasks(
  projectId: string,
  phaseId: string,
  stepId: string
): Promise<Task[]> {
  try {
    const q = query(
      collection(db, 'projects', projectId, 'phases', phaseId, 'steps', stepId, 'tasks'),
      orderBy('order')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task));
  } catch (error) {
    log.error('Error getting step tasks:', { data: error }, 'taskOperations');
    throw new Error('Failed to fetch step tasks');
  }
}

/**
 * Create a new task
 */
export async function createTask(
  projectId: string,
  phaseId: string,
  stepId: string,
  taskData: Partial<Task>
): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const data = {
      ...taskData,
      status: TaskStatus.NOT_STARTED,
      progress: 0,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'projects', projectId, 'phases', phaseId, 'steps', stepId, 'tasks'),
      data
    );
    
    // Update step, phase and project progress
    await updateStepProgress(projectId, phaseId, stepId);
    await updatePhaseProgress(projectId, phaseId);
    await updateProjectProgress(projectId);
    
    return docRef.id;
  } catch (error) {
    log.error('Error creating task:', { data: error }, 'taskOperations');
    throw new Error('Failed to create task');
  }
}

/**
 * Update a task
 */
export async function updateTask(
  projectId: string,
  phaseId: string,
  stepId: string,
  taskId: string,
  data: Partial<Task>
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const updateData = {
      ...data,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    };

    const docRef = doc(
      db, 'projects', projectId, 'phases', phaseId, 'steps', stepId, 'tasks', taskId
    );
    await updateDoc(docRef, updateData);
    
    // Update step, phase and project progress
    await updateStepProgress(projectId, phaseId, stepId);
    await updatePhaseProgress(projectId, phaseId);
    await updateProjectProgress(projectId);
  } catch (error) {
    log.error('Error updating task:', { data: error }, 'taskOperations');
    throw new Error('Failed to update task');
  }
}