import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Phase } from '@/types/project.types';
import { updateProjectProgress } from './progressCalculations';
import { log } from '@/lib/logger';

/**
 * Get all phases for a project
 */
export async function getProjectPhases(projectId: string): Promise<Phase[]> {
  try {
    const q = query(
      collection(db, 'projects', projectId, 'phases'),
      orderBy('order')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Phase));
  } catch (error) {
    log.error('Error getting project phases:', { data: error }, 'phaseOperations');
    throw new Error('Failed to fetch project phases');
  }
}

/**
 * Get a specific phase by ID
 */
export async function getPhaseById(projectId: string, phaseId: string): Promise<Phase | null> {
  try {
    const docRef = doc(db, 'projects', projectId, 'phases', phaseId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Phase;
  } catch (error) {
    log.error('Error getting phase:', { data: error }, 'phaseOperations');
    throw new Error('Failed to fetch phase');
  }
}

/**
 * Update a phase
 */
export async function updatePhase(
  projectId: string, 
  phaseId: string, 
  data: Partial<Phase>
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const updateData = {
      ...data,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    };

    const docRef = doc(db, 'projects', projectId, 'phases', phaseId);
    await updateDoc(docRef, updateData);
    
    // Update project progress
    await updateProjectProgress(projectId);
  } catch (error) {
    log.error('Error updating phase:', { data: error }, 'phaseOperations');
    throw new Error('Failed to update phase');
  }
}