/**
 * Project Team Service
 * Team member management operations
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ProjectCrudService } from './ProjectCrudService';

const COLLECTION_NAME = 'projects';

export class ProjectTeamService {
  static async addTeamMember(
    projectId: string, 
    staffId: string, 
    role: string, 
    position: string
  ): Promise<void> {
    try {
      const project = await ProjectCrudService.getProjectById(projectId);
      
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

  static async removeTeamMember(projectId: string, staffId: string): Promise<void> {
    try {
      const project = await ProjectCrudService.getProjectById(projectId);
      
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
}