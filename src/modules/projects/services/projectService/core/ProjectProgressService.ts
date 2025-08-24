/**
 * Project Progress Service
 * Progress tracking and calculation operations
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Project } from '../../../types/project.types';
import { ProjectCrudService } from './ProjectCrudService';

const COLLECTION_NAME = 'projects';

export class ProjectProgressService {
  static async updateProjectProgress(
    projectId: string, 
    progress: Partial<Project['progress']>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      const project = await ProjectCrudService.getProjectById(projectId);
      
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
}