import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/src/config/firebase';
import { Step } from '@/types/project.types';
import { updatePhaseProgress, updateProjectProgress } from './progressCalculations';
import { log } from '@/lib/logger';

/**
 * Get all steps for a phase
 */
export async function getPhaseSteps(projectId: string, phaseId: string): Promise<Step[]> {
  try {
    const q = query(
      collection(db, 'projects', projectId, 'phases', phaseId, 'steps'),
      orderBy('order')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Step));
  } catch (error) {
    log.error('Error getting phase steps:', { data: error }, 'stepOperations');
    throw new Error('Failed to fetch phase steps');
  }
}

/**
 * Update a step
 */
export async function updateStep(
  projectId: string,
  phaseId: string,
  stepId: string,
  data: Partial<Step>
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const updateData = {
      ...data,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    };

    const docRef = doc(db, 'projects', projectId, 'phases', phaseId, 'steps', stepId);
    await updateDoc(docRef, updateData);
    
    // Update phase and project progress
    await updatePhaseProgress(projectId, phaseId);
    await updateProjectProgress(projectId);
  } catch (error) {
    log.error('Error updating step:', { data: error }, 'stepOperations');
    throw new Error('Failed to update step');
  }
}