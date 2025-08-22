/**
 * Contractor Team Service - Team management operations
 * Focused service following 250-line limit rule
 */

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { neonDb } from '@/lib/neon/connection';
import { contractorTeams, teamMembers } from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';
import { 
  ContractorTeam, 
  TeamMember,
  TeamFormData,
  MemberFormData,
  TeamFilter
} from '@/types/contractor.types';

export const contractorTeamService = {
  /**
   * Get teams for a contractor
   */
  async getTeamsByContractor(contractorId: string, filter?: TeamFilter): Promise<ContractorTeam[]> {
    try {
      const constraints = [
        where('contractorId', '==', contractorId),
        orderBy('teamName', 'asc')
      ];
      
      if (filter?.teamType?.length) {
        constraints.push(where('teamType', 'in', filter.teamType));
      }
      
      if (filter?.availability?.length) {
        constraints.push(where('availability', 'in', filter.availability));
      }
      
      if (filter?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filter.isActive));
      }
      
      const q = query(collection(db, 'contractor_teams'), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as ContractorTeam));
    } catch (error) {
      console.error('Error getting contractor teams:', error);
      throw new Error('Failed to fetch contractor teams');
    }
  },

  /**
   * Create new team
   */
  async createTeam(contractorId: string, data: TeamFormData): Promise<string> {
    try {
      const now = Timestamp.now();
      
      const teamData = {
        contractorId,
        ...data,
        currentCapacity: 0,
        availableCapacity: data.maxCapacity,
        isActive: true,
        availability: 'available',
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'contractor_teams'), teamData);
      
      // Sync to Neon
      try {
        await neonDb.insert(contractorTeams).values({
          id: docRef.id,
          contractorId,
          teamName: data.teamName,
          teamType: data.teamType,
          specialization: data.specialization,
          maxCapacity: data.maxCapacity,
          currentCapacity: 0,
          availableCapacity: data.maxCapacity,
          isActive: true,
          availability: 'available',
          baseLocation: data.baseLocation,
          operatingRadius: data.operatingRadius,
        });
      } catch (neonError) {
        console.warn('Failed to sync team to Neon:', neonError);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  },

  /**
   * Update team
   */
  async updateTeam(teamId: string, data: Partial<TeamFormData>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(doc(db, 'contractor_teams', teamId), updateData);
      
      // Sync to Neon
      try {
        const neonUpdateData: any = { updatedAt: new Date() };
        if (data.teamName) neonUpdateData.teamName = data.teamName;
        if (data.teamType) neonUpdateData.teamType = data.teamType;
        if (data.specialization) neonUpdateData.specialization = data.specialization;
        if (data.maxCapacity) neonUpdateData.maxCapacity = data.maxCapacity;
        
        await neonDb
          .update(contractorTeams)
          .set(neonUpdateData)
          .where(eq(contractorTeams.id, teamId));
      } catch (neonError) {
        console.warn('Failed to sync team update to Neon:', neonError);
      }
    } catch (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }
  },

  /**
   * Delete team
   */
  async deleteTeam(teamId: string): Promise<void> {
    try {
      // Check for active assignments
      const assignmentsQuery = query(
        collection(db, 'project_assignments'),
        where('teamId', '==', teamId),
        where('status', 'in', ['assigned', 'active'])
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      
      if (!assignmentsSnapshot.empty) {
        throw new Error('Cannot delete team with active assignments');
      }
      
      await deleteDoc(doc(db, 'contractor_teams', teamId));
      
      // Delete from Neon
      try {
        await neonDb.delete(contractorTeams).where(eq(contractorTeams.id, teamId));
      } catch (neonError) {
        console.warn('Failed to delete team from Neon:', neonError);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('Failed to delete team');
    }
  },

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const q = query(
        collection(db, 'team_members'),
        where('teamId', '==', teamId),
        orderBy('firstName', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as TeamMember));
    } catch (error) {
      console.error('Error getting team members:', error);
      throw new Error('Failed to fetch team members');
    }
  },

  /**
   * Add team member
   */
  async addTeamMember(teamId: string, contractorId: string, data: MemberFormData): Promise<string> {
    try {
      const now = Timestamp.now();
      
      const memberData = {
        teamId,
        contractorId,
        ...data,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'team_members'), memberData);
      
      // Sync to Neon
      try {
        await neonDb.insert(teamMembers).values({
          id: docRef.id,
          teamId,
          contractorId,
          firstName: data.firstName,
          lastName: data.lastName,
          idNumber: data.idNumber,
          email: data.email,
          phone: data.phone,
          role: data.role,
          skillLevel: data.skillLevel,
          certifications: data.certifications || [],
          specialSkills: data.specialSkills || [],
          employmentType: data.employmentType,
          hourlyRate: data.hourlyRate?.toString(),
          dailyRate: data.dailyRate?.toString(),
          isActive: true,
          isTeamLead: data.isTeamLead,
        });
      } catch (neonError) {
        console.warn('Failed to sync member to Neon:', neonError);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  },

  /**
   * Update team member
   */
  async updateTeamMember(memberId: string, data: Partial<MemberFormData>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(doc(db, 'team_members', memberId), updateData);
    } catch (error) {
      console.error('Error updating team member:', error);
      throw new Error('Failed to update team member');
    }
  },

  /**
   * Remove team member
   */
  async removeTeamMember(memberId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'team_members', memberId));
      
      // Delete from Neon
      try {
        await neonDb.delete(teamMembers).where(eq(teamMembers.id, memberId));
      } catch (neonError) {
        console.warn('Failed to delete member from Neon:', neonError);
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }
};