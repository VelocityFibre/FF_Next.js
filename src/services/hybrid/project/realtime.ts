/**
 * Real-time Project Operations (Firebase)
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import type { Project } from '@/types/project.types';

/**
 * Get all projects (real-time)
 */
export async function getAllProjects(): Promise<Project[]> {
  const snapshot = await getDocs(collection(db, 'projects'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Project));
}

/**
 * Get project by ID (real-time)
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const docRef = doc(db, 'projects', id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return { id: snapshot.id, ...snapshot.data() } as Project;
}

/**
 * Create new project (Firebase)
 */
export async function createProject(projectData: Omit<Project, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'projects'), {
    ...projectData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

/**
 * Update project (Firebase)
 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const docRef = doc(db, 'projects', id);
  
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete project (Firebase)
 */
export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', id));
}

/**
 * Subscribe to project changes (real-time)
 */
export function subscribeToProject(id: string, callback: (project: Project | null) => void): () => void {
  const docRef = doc(db, 'projects', id);
  
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Project);
    } else {
      callback(null);
    }
  });
}

/**
 * Subscribe to projects list (real-time)
 */
export function subscribeToProjects(callback: (projects: Project[]) => void): () => void {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, orderBy('updatedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
    callback(projects);
  });
}