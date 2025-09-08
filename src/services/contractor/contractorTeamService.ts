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
import { db } from '@/src/config/firebase';
import { neonDb } from '@/lib/neon/connection';
import { contractorTeams, teamMembers } from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';
import { log } from '@/lib/logger';
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
      // Single field index on contractorId is automatically created by Firestore
      const constraints = [
        where('contractorId', '==', contractorId)
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
      
      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as ContractorTeam));
      
      // Sort teams by name in JavaScript
      return teams.sort((a, b) => a.teamName.localeCompare(b.teamName));
    } catch (error) {
      log.error('Error getting contractor teams:', { data: error }, 'contractorTeamService');
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
      
      // Sync to Neon - contractor_id needs to be a UUID
      // For now, skip Neon sync if contractorId is a Firebase string ID
      try {
        // Only sync if contractorId looks like a UUID
        if (contractorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          await neonDb.insert(contractorTeams).values({
            id: docRef.id as any,
            contractorId: contractorId as any,
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
        }
      } catch (neonError) {
        log.warn('Failed to sync team to Neon:', { data: neonError }, 'contractorTeamService');
        // Continue anyway - Firebase is primary
      }
      
      return docRef.id;
    } catch (error) {
      log.error('Error creating team:', { data: error }, 'contractorTeamService');
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
      
      // Sync to Neon - only if teamId is UUID format
      try {
        if (teamId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          const neonUpdateData: any = { updatedAt: new Date() };
          if (data.teamName) neonUpdateData.teamName = data.teamName;
          if (data.teamType) neonUpdateData.teamType = data.teamType;
          if (data.specialization) neonUpdateData.specialization = data.specialization;
          if (data.maxCapacity) neonUpdateData.maxCapacity = data.maxCapacity;
          
          await neonDb
            .update(contractorTeams)
            .set(neonUpdateData)
            .where(eq(contractorTeams.id, teamId as any));
        }
      } catch (neonError) {
        log.warn('Failed to sync team update to Neon:', { data: neonError }, 'contractorTeamService');
        // Continue anyway - Firebase is primary
      }
    } catch (error) {
      log.error('Error updating team:', { data: error }, 'contractorTeamService');
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
        log.warn('Failed to delete team from Neon:', { data: neonError }, 'contractorTeamService');
      }
    } catch (error) {
      log.error('Error deleting team:', { data: error }, 'contractorTeamService');
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
      log.error('Error getting team members:', { data: error }, 'contractorTeamService');
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
        log.warn('Failed to sync member to Neon:', { data: neonError }, 'contractorTeamService');
      }
      
      return docRef.id;
    } catch (error) {
      log.error('Error adding team member:', { data: error }, 'contractorTeamService');
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
      log.error('Error updating team member:', { data: error }, 'contractorTeamService');
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
        log.warn('Failed to delete member from Neon:', { data: neonError }, 'contractorTeamService');
      }
    } catch (error) {
      log.error('Error removing team member:', { data: error }, 'contractorTeamService');
      throw new Error('Failed to remove team member');
    }
  }
};