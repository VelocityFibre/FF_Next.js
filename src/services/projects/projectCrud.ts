import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  QueryConstraint,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { 
  Project, 
  ProjectFormData,
  ProjectFilter,
  ProjectStatus
} from '@/types/project.types';
import { generateProjectPhases } from './projectPhases';

/**
 * Get all projects with optional filtering
 */
export async function getAllProjects(filter?: ProjectFilter): Promise<Project[]> {
  try {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    if (filter?.status?.length) {
      constraints.push(where('status', 'in', filter.status));
    }
    
    if (filter?.projectType?.length) {
      constraints.push(where('projectType', 'in', filter.projectType));
    }
    
    if (filter?.clientId) {
      constraints.push(where('clientId', '==', filter.clientId));
    }
    
    if (filter?.projectManagerId) {
      constraints.push(where('projectManagerId', '==', filter.projectManagerId));
    }
    
    const q = query(collection(db, 'projects'), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  } catch (error) {
    console.error('Error getting projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const docRef = doc(db, 'projects', id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return { 
      id: snapshot.id, 
      ...snapshot.data() 
    } as Project;
  } catch (error) {
    console.error('Error getting project:', error);
    throw new Error('Failed to fetch project');
  }
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectFormData): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const projectData: any = {
      ...data,
      status: ProjectStatus.PLANNING,
      actualProgress: 0,
      plannedProgress: 0,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : null,
      endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    
    // Generate phases based on project type
    if (data.projectType === 'fiber') {
      await generateProjectPhases(docRef.id, data.projectType);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project');
  }
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      ...data,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    };

    // Convert date strings to Firestore Timestamps
    if (data.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
    }
    if (data.endDate) {
      updateData.endDate = Timestamp.fromDate(new Date(data.endDate));
    }

    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Failed to update project');
  }
}

/**
 * Delete a project and all its sub-collections
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    // Delete phases and their sub-collections
    const phasesSnapshot = await getDocs(collection(db, 'projects', id, 'phases'));
    
    for (const phaseDoc of phasesSnapshot.docs) {
      // Delete steps
      const stepsSnapshot = await getDocs(
        collection(db, 'projects', id, 'phases', phaseDoc.id, 'steps')
      );
      
      for (const stepDoc of stepsSnapshot.docs) {
        // Delete tasks
        const tasksSnapshot = await getDocs(
          collection(db, 'projects', id, 'phases', phaseDoc.id, 'steps', stepDoc.id, 'tasks')
        );
        
        for (const taskDoc of tasksSnapshot.docs) {
          await deleteDoc(taskDoc.ref);
        }
        
        await deleteDoc(stepDoc.ref);
      }
      
      await deleteDoc(phaseDoc.ref);
    }
    
    // Delete the project document
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
}

/**
 * Get projects by client ID
 */
export async function getProjectsByClient(clientId: string): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  } catch (error) {
    console.error('Error getting client projects:', error);
    throw new Error('Failed to fetch client projects');
  }
}

/**
 * Get active projects
 */
export async function getActiveProjects(): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('status', '==', ProjectStatus.ACTIVE),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  } catch (error) {
    console.error('Error getting active projects:', error);
    throw new Error('Failed to fetch active projects');
  }
}