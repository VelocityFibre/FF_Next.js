import { 
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  Project,
  ProjectHierarchy,
  Phase,
  Step,
  Task
} from '@/types/project.types';

/**
 * Subscribe to real-time project updates
 */
export function subscribeToProject(
  projectId: string, 
  callback: (project: Project | null) => void
): Unsubscribe {
  const docRef = doc(db, 'projects', projectId);
  
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: snapshot.id,
        ...snapshot.data()
      } as Project);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in project subscription:', error);
    callback(null);
  });
}

/**
 * Subscribe to real-time project list updates
 */
export function subscribeToProjects(
  callback: (projects: Project[]) => void,
  filter?: { status?: string; clientId?: string }
): Unsubscribe {
  let q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
  
  if (filter?.status) {
    q = query(q, where('status', '==', filter.status));
  }
  
  if (filter?.clientId) {
    q = query(q, where('clientId', '==', filter.clientId));
  }
  
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
    callback(projects);
  }, (error) => {
    console.error('Error in projects subscription:', error);
    callback([]);
  });
}

/**
 * Subscribe to project phases updates
 */
export function subscribeToProjectPhases(
  projectId: string,
  callback: (phases: Phase[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'projects', projectId, 'phases'),
    orderBy('order')
  );
  
  return onSnapshot(q, (snapshot) => {
    const phases = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Phase));
    callback(phases);
  }, (error) => {
    console.error('Error in phases subscription:', error);
    callback([]);
  });
}

/**
 * Subscribe to phase steps updates
 */
export function subscribeToPhaseSteps(
  projectId: string,
  phaseId: string,
  callback: (steps: Step[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'projects', projectId, 'phases', phaseId, 'steps'),
    orderBy('order')
  );
  
  return onSnapshot(q, (snapshot) => {
    const steps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Step));
    callback(steps);
  }, (error) => {
    console.error('Error in steps subscription:', error);
    callback([]);
  });
}

/**
 * Subscribe to step tasks updates
 */
export function subscribeToStepTasks(
  projectId: string,
  phaseId: string,
  stepId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'projects', projectId, 'phases', phaseId, 'steps', stepId, 'tasks'),
    orderBy('order')
  );
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task));
    callback(tasks);
  }, (error) => {
    console.error('Error in tasks subscription:', error);
    callback([]);
  });
}

/**
 * Subscribe to complete project hierarchy
 */
export function subscribeToProjectHierarchy(
  projectId: string,
  callback: (hierarchy: ProjectHierarchy | null) => void
): Unsubscribe[] {
  const unsubscribes: Unsubscribe[] = [];
  const hierarchy: ProjectHierarchy = {
    project: null as any,
    phases: []
  };
  
  // Subscribe to project
  unsubscribes.push(
    subscribeToProject(projectId, (project) => {
      if (!project) {
        callback(null);
        return;
      }
      hierarchy.project = project;
      callback({ ...hierarchy });
    })
  );
  
  // Subscribe to phases
  unsubscribes.push(
    subscribeToProjectPhases(projectId, async (phases) => {
      hierarchy.phases = [];
      
      for (const phase of phases) {
        const phaseWithSteps: Phase & { steps?: Step[] } = { ...phase, steps: [] };
        
        // Get steps for each phase
        const stepsQuery = query(
          collection(db, 'projects', projectId, 'phases', phase.id, 'steps'),
          orderBy('order')
        );
        
        // Subscribe to steps for this phase
        unsubscribes.push(
          onSnapshot(stepsQuery, async (stepsSnapshot) => {
            phaseWithSteps.steps = [];
            
            for (const stepDoc of stepsSnapshot.docs) {
              const step = { id: stepDoc.id, ...stepDoc.data() } as Step;
              const stepWithTasks: Step & { tasks?: Task[] } = { ...step, tasks: [] };
              
              // Get tasks for each step
              const tasksQuery = query(
                collection(db, 'projects', projectId, 'phases', phase.id, 'steps', step.id, 'tasks'),
                orderBy('order')
              );
              
              // Subscribe to tasks for this step
              unsubscribes.push(
                onSnapshot(tasksQuery, (tasksSnapshot) => {
                  stepWithTasks.tasks = tasksSnapshot.docs.map(taskDoc => ({
                    id: taskDoc.id,
                    ...taskDoc.data()
                  } as Task));
                  
                  // Update hierarchy and trigger callback
                  callback({ ...hierarchy });
                })
              );
              
              phaseWithSteps.steps!.push(stepWithTasks);
            }
            
            // Update phases in hierarchy
            const phaseIndex = hierarchy.phases.findIndex(p => p.id === phase.id);
            if (phaseIndex >= 0) {
              hierarchy.phases[phaseIndex] = phaseWithSteps;
            } else {
              hierarchy.phases.push(phaseWithSteps);
            }
            
            callback({ ...hierarchy });
          })
        );
      }
      
      callback({ ...hierarchy });
    })
  );
  
  return unsubscribes;
}

/**
 * Unsubscribe from multiple subscriptions
 */
export function unsubscribeAll(unsubscribes: Unsubscribe[]): void {
  unsubscribes.forEach(unsubscribe => unsubscribe());
}