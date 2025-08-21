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
  limit, 
  DocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  ProjectListQuery,
  ProjectStatus
} from '../types/project.types';

const COLLECTION_NAME = 'projects';

class ProjectService {
  // Create a new project
  async createProject(data: CreateProjectRequest): Promise<string> {
    try {
      const projectData = {
        ...data,
        status: ProjectStatus.PLANNING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        progress: {
          overallPercentage: 0,
          tasksCompleted: 0,
          totalTasks: 0,
          phases: [],
          polesInstalled: 0,
          totalPoles: 0,
          dropsCompleted: 0,
          totalDrops: 0,
          fibreCableInstalled: 0,
          totalFibreCableRequired: 0,
        },
        sowDocuments: [],
        teamMembers: data.teamMembers?.map(staffId => ({
          staffId,
          assignedDate: new Date().toISOString(),
          isActive: true,
        })) || [],
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), projectData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  // Get all projects with optional filters
  async getProjects(queryOptions?: ProjectListQuery): Promise<{
    projects: Project[];
    total: number;
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      let q = collection(db, COLLECTION_NAME);
      const constraints: any[] = [];

      // Apply filters
      if (queryOptions?.filters) {
        const filters = queryOptions.filters;
        
        if (filters.status && filters.status.length > 0) {
          constraints.push(where('status', 'in', filters.status));
        }
        
        if (filters.priority && filters.priority.length > 0) {
          constraints.push(where('priority', 'in', filters.priority));
        }
        
        if (filters.clientId) {
          constraints.push(where('clientId', '==', filters.clientId));
        }
        
        if (filters.projectManagerId) {
          constraints.push(where('projectManagerId', '==', filters.projectManagerId));
        }
      }

      // Apply sorting
      if (queryOptions?.sort) {
        const { field, direction } = queryOptions.sort;
        constraints.push(orderBy(field, direction));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      // Apply pagination
      const pageLimit = queryOptions?.limit || 20;
      constraints.push(limit(pageLimit + 1));

      const queryRef = query(q, ...constraints);
      const snapshot = await getDocs(queryRef);
      
      const projects: Project[] = [];
      let lastVisible: DocumentSnapshot | undefined;
      
      snapshot.docs.slice(0, pageLimit).forEach((doc, index) => {
        if (index === pageLimit - 1) {
          lastVisible = doc;
        }
        projects.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        } as Project);
      });

      const result: {
        projects: Project[];
        total: number;
        hasMore: boolean;
        lastDoc?: DocumentSnapshot;
      } = {
        projects,
        total: projects.length,
        hasMore: snapshot.docs.length > pageLimit,
      };
      
      if (lastVisible) {
        result.lastDoc = lastVisible;
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  // Get a single project by ID
  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  }

  // Update a project
  async updateProject(data: UpdateProjectRequest): Promise<void> {
    try {
      const { id, ...updateData } = data;
      const docRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }

  // Update project status
  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      throw new Error('Failed to update project status');
    }
  }

  // Update project progress
  async updateProjectProgress(
    projectId: string, 
    progress: Partial<Project['progress']>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      const project = await this.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedProgress = {
        ...project.progress,
        ...progress,
      };

      // Calculate overall percentage based on tasks if not explicitly provided
      if (updatedProgress.totalTasks > 0 && !progress.overallPercentage) {
        updatedProgress.overallPercentage = Math.round(
          (updatedProgress.tasksCompleted / updatedProgress.totalTasks) * 100
        );
      }

      await updateDoc(docRef, {
        progress: updatedProgress,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw new Error('Failed to update project progress');
    }
  }

  // Add team member to project
  async addTeamMember(
    projectId: string, 
    staffId: string, 
    role: string, 
    position: string
  ): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Check if member already exists
      const existingMember = project.teamMembers.find(m => m.staffId === staffId);
      if (existingMember) {
        throw new Error('Team member already assigned to project');
      }

      const newMember = {
        staffId,
        name: '', // Will be populated from staff data
        role,
        position,
        assignedDate: new Date().toISOString(),
        isActive: true,
      };

      const docRef = doc(db, COLLECTION_NAME, projectId);
      await updateDoc(docRef, {
        teamMembers: [...project.teamMembers, newMember],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  }

  // Remove team member from project
  async removeTeamMember(projectId: string, staffId: string): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedMembers = project.teamMembers.filter(m => m.staffId !== staffId);

      const docRef = doc(db, COLLECTION_NAME, projectId);
      await updateDoc(docRef, {
        teamMembers: updatedMembers,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }

  // Get projects by client
  async getProjectsByClient(clientId: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      } as Project));
    } catch (error) {
      console.error('Error fetching projects by client:', error);
      throw new Error('Failed to fetch projects by client');
    }
  }

  // Get projects by manager
  async getProjectsByManager(managerId: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('projectManagerId', '==', managerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      } as Project));
    } catch (error) {
      console.error('Error fetching projects by manager:', error);
      throw new Error('Failed to fetch projects by manager');
    }
  }
}

export const projectService = new ProjectService();