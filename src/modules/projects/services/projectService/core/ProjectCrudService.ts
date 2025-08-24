/**
 * Project CRUD Service
 * Core create, read, update, delete operations
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
  where, 
  orderBy, 
  limit, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  ProjectListQuery,
  ProjectStatus
} from '../../../types/project.types';
import { ProjectQueryResult } from '../types/service.types';

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
      console.error('Error creating project:', error);
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
      console.error('Error fetching project:', error);
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
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting project:', error);
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
      console.error('Error updating project status:', error);
      throw new Error('Failed to update project status');
    }
  }
}