import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ProjectAssignment } from '@/types/staff.types';
import { log } from '@/lib/logger';

/**
 * Project assignment operations for staff
 */
export const staffAssignmentService = {
  /**
   * Assign staff to project
   */
  async assignToProject(assignment: Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      
      const assignmentData = {
        ...assignment,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'projectAssignments'), assignmentData);
      
      // Update staff member's project count
      await this.updateStaffProjectCount(assignment.staffId);
      
      return docRef.id;
    } catch (error) {
      log.error('Error assigning staff to project:', { data: error }, 'staffAssignmentService');
      throw new Error('Failed to assign staff to project');
    }
  },

  /**
   * Update project assignment
   */
  async updateAssignment(id: string, data: Partial<ProjectAssignment>): Promise<void> {
    try {
      const docRef = doc(db, 'projectAssignments', id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(docRef, updateData);
      
      // If status changed, update staff project count
      if (data.status) {
        const assignmentDoc = await getDocs(query(
          collection(db, 'projectAssignments'),
          where('id', '==', id)
        ));
        
        if (!assignmentDoc.empty) {
          const assignment = assignmentDoc.docs[0].data() as ProjectAssignment;
          await this.updateStaffProjectCount(assignment.staffId);
        }
      }
    } catch (error) {
      log.error('Error updating assignment:', { data: error }, 'staffAssignmentService');
      throw new Error('Failed to update assignment');
    }
  },

  /**
   * Update staff member's current project count
   */
  async updateStaffProjectCount(staffId: string): Promise<void> {
    try {
      // Get active assignments for this staff member
      const q = query(
        collection(db, 'projectAssignments'),
        where('staffId', '==', staffId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      const activeCount = snapshot.size;
      
      // Update staff member's current project count
      const staffRef = doc(db, 'staff', staffId);
      await updateDoc(staffRef, {
        currentProjectCount: activeCount,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      log.error('Error updating staff project count:', { data: error }, 'staffAssignmentService');
      throw new Error('Failed to update staff project count');
    }
  },

  /**
   * Get available staff for a project
   */
  async getAvailableStaff(projectRequirements?: { skills?: string[], department?: string }): Promise<any[]> {
    try {
      const staffQuery = query(
        collection(db, 'staff'),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(staffQuery);
      let availableStaff = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      
      // Filter by availability (not at max capacity)
      availableStaff = availableStaff.filter(staff => 
        (staff.currentProjectCount || 0) < (staff.maxProjectCount || 5)
      );
      
      // Filter by requirements if provided
      if (projectRequirements?.skills?.length) {
        availableStaff = availableStaff.filter(staff =>
          projectRequirements.skills!.some(skill => 
            (staff.skills || []).includes(skill)
          )
        );
      }
      
      if (projectRequirements?.department) {
        availableStaff = availableStaff.filter(staff =>
          staff.department === projectRequirements.department
        );
      }
      
      return availableStaff;
    } catch (error) {
      log.error('Error getting available staff:', { data: error }, 'staffAssignmentService');
      throw new Error('Failed to get available staff');
    }
  }
};