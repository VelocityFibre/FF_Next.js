/**
 * Project CRUD Service
 * Core create, read, update, delete operations
 */

import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../../../config/firebase';
import { log } from '@/lib/logger';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  ProjectStatus
} from '../../../types/project.types';

const COLLECTION_NAME = 'projects';

export class ProjectCrudService {
  static async createProject(data: CreateProjectRequest): Promise<string> {
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
      log.error('Error creating project:', { data: error }, 'ProjectCrudService');
      throw new Error('Failed to create project');
    }
  }

  static async getProjectById(projectId: string): Promise<Project | null> {
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
      log.error('Error fetching project:', { data: error }, 'ProjectCrudService');
      throw new Error('Failed to fetch project');
    }
  }

  static async updateProject(data: UpdateProjectRequest): Promise<void> {
    try {
      const { id, ...updateData } = data;
      const docRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      log.error('Error updating project:', { data: error }, 'ProjectCrudService');
      throw new Error('Failed to update project');
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      await deleteDoc(docRef);
    } catch (error) {
      log.error('Error deleting project:', { data: error }, 'ProjectCrudService');
      throw new Error('Failed to delete project');
    }
  }

  static async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      log.error('Error updating project status:', { data: error }, 'ProjectCrudService');
      throw new Error('Failed to update project status');
    }
  }
}