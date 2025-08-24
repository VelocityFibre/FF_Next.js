/**
 * Projects Service
 * Handles all project-related operations
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  clientId?: string;
  clientName?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  actualCost?: number;
  progress?: number;
  teamMembers?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProjectFormData {
  name: string;
  code: string;
  description?: string;
  status?: string;
  clientId?: string;
  clientName?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  teamMembers?: string[];
  tags?: string[];
}

export interface ProjectFilter {
  status?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  tags?: string[];
}

class ProjectsService {
  private collectionName = 'projects';

  /**
   * Get all projects
   */
  async getAll(filter?: ProjectFilter): Promise<Project[]> {
    try {
      let q = query(collection(db, this.collectionName));

      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter?.clientId) {
        q = query(q, where('clientId', '==', filter.clientId));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      const projects: Project[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Project);
      });

      // Apply client-side filtering
      let filtered = projects;
      
      if (filter?.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
        );
      }

      if (filter?.tags && filter.tags.length > 0) {
        filtered = filtered.filter(p => 
          p.tags?.some(tag => filter.tags?.includes(tag))
        );
      }

      return filtered;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get a single project by ID
   */
  async getById(id: string): Promise<Project | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async create(data: ProjectFormData): Promise<Project> {
    try {
      const projectData = {
        ...data,
        status: data.status || 'planning',
        startDate: data.startDate ? Timestamp.fromDate(data.startDate) : null,
        endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        progress: 0,
        actualCost: 0
      };

      const docRef = await addDoc(collection(db, this.collectionName), projectData);
      const created = await this.getById(docRef.id);
      
      if (!created) {
        throw new Error('Failed to create project');
      }

      return created;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  async update(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now()
      };

      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate);
      }

      await updateDoc(docRef, updateData);
      
      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Project not found after update');
      }

      return updated;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Get active projects
   */
  async getActiveProjects(): Promise<Project[]> {
    return this.getAll({ status: 'active' });
  }

  /**
   * Get projects by client
   */
  async getByClient(clientId: string): Promise<Project[]> {
    return this.getAll({ clientId });
  }

  /**
   * Update project progress
   */
  async updateProgress(id: string, progress: number): Promise<Project> {
    return this.update(id, { metadata: { progress } });
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    onHold: number;
    planning: number;
    totalBudget: number;
    totalActualCost: number;
  }> {
    const projects = await this.getAll();
    
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
      planning: projects.filter(p => p.status === 'planning').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalActualCost: projects.reduce((sum, p) => sum + (p.actualCost || 0), 0)
    };
  }
}

export const projectsService = new ProjectsService();