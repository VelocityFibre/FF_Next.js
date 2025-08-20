import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { 
  Phase,
  Step,
  Task,
  PhaseTemplate,
  FIBER_PROJECT_PHASES,
  PhaseStatus,
  StepStatus,
  TaskStatus
} from '@/types/project.types';

/**
 * Generate phases for a new project based on project type
 */
export async function generateProjectPhases(projectId: string, projectType: string): Promise<void> {
  try {
    const templates = projectType === 'fiber' ? FIBER_PROJECT_PHASES : [];
    const batch = writeBatch(db);
    
    for (const template of templates) {
      const phaseData = {
        name: template.name,
        description: template.description,
        order: template.order,
        status: PhaseStatus.NOT_STARTED,
        progress: 0,
        startDate: null,
        endDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const phaseRef = doc(collection(db, 'projects', projectId, 'phases'));
      batch.set(phaseRef, phaseData);
      
      // Generate steps for each phase
      if (template.defaultSteps) {
        for (const stepTemplate of template.defaultSteps) {
          const stepData = {
            name: stepTemplate.name,
            description: stepTemplate.description,
            order: stepTemplate.order,
            status: StepStatus.NOT_STARTED,
            progress: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          const stepRef = doc(collection(db, 'projects', projectId, 'phases', phaseRef.id, 'steps'));
          batch.set(stepRef, stepData);
        }
      }
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error generating project phases:', error);
    throw new Error('Failed to generate project phases');
  }
}

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
    console.error('Error getting project phases:', error);
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
    console.error('Error getting phase:', error);
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
    console.error('Error updating phase:', error);
    throw new Error('Failed to update phase');
  }
}

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
    console.error('Error getting phase steps:', error);
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
    console.error('Error updating step:', error);
    throw new Error('Failed to update step');
  }
}

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
    console.error('Error getting step tasks:', error);
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
    console.error('Error creating task:', error);
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
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
}

// Helper functions for progress calculation
async function updateProjectProgress(projectId: string): Promise<void> {
  const phases = await getProjectPhases(projectId);
  const totalProgress = phases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
  const avgProgress = phases.length > 0 ? Math.round(totalProgress / phases.length) : 0;
  
  await updateDoc(doc(db, 'projects', projectId), {
    actualProgress: avgProgress,
    updatedAt: serverTimestamp()
  });
}

async function updatePhaseProgress(projectId: string, phaseId: string): Promise<void> {
  const steps = await getPhaseSteps(projectId, phaseId);
  const totalProgress = steps.reduce((sum, step) => sum + (step.progress || 0), 0);
  const avgProgress = steps.length > 0 ? Math.round(totalProgress / steps.length) : 0;
  
  await updateDoc(doc(db, 'projects', projectId, 'phases', phaseId), {
    progress: avgProgress,
    updatedAt: serverTimestamp()
  });
}

async function updateStepProgress(projectId: string, phaseId: string, stepId: string): Promise<void> {
  const tasks = await getStepTasks(projectId, phaseId, stepId);
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  await updateDoc(doc(db, 'projects', projectId, 'phases', phaseId, 'steps', stepId), {
    progress,
    updatedAt: serverTimestamp()
  });
}