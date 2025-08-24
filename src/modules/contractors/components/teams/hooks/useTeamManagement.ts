import { useState, useEffect } from 'react';
import { contractorService } from '@/services/contractorService';
import { ContractorTeam, TeamMember, TeamFormData, MemberFormData } from '@/types/contractor.types';
import toast from 'react-hot-toast';

export function useTeamManagement(contractorId: string) {
  const [teams, setTeams] = useState<ContractorTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<ContractorTeam | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ContractorTeam | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    loadTeams();
  }, [contractorId]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const data = await contractorService.teams.getTeamsByContractor(contractorId);
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const data = await contractorService.teams.getTeamMembers(teamId);
      setTeamMembers(data);
    } catch (error) {
      console.error('Failed to load team members:', error);
      toast.error('Failed to load team members');
    }
  };

  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      await contractorService.teams.createTeam(contractorId, data);
      toast.success('Team created successfully');
      setShowTeamForm(false);
      loadTeams();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    }
  };

  const handleUpdateTeam = async (teamId: string, data: Partial<TeamFormData>) => {
    try {
      await contractorService.teams.updateTeam(teamId, data);
      toast.success('Team updated successfully');
      setEditingTeam(null);
      loadTeams();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await contractorService.teams.deleteTeam(teamId);
      toast.success('Team deleted successfully');
      loadTeams();
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(teams[0] || null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const handleAddMember = async (data: MemberFormData) => {
    if (!selectedTeam) return;
    
    try {
      await contractorService.teams.addTeamMember(selectedTeam.id, contractorId, data);
      toast.success('Team member added successfully');
      setShowMemberForm(false);
      loadTeamMembers(selectedTeam.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add team member');
    }
  };

  const handleUpdateMember = async (memberId: string, data: Partial<MemberFormData>) => {
    try {
      await contractorService.teams.updateTeamMember(memberId, data);
      toast.success('Team member updated successfully');
      setEditingMember(null);
      if (selectedTeam) {
        loadTeamMembers(selectedTeam.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update team member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await contractorService.teams.removeTeamMember(memberId);
      toast.success('Team member removed successfully');
      if (selectedTeam) {
        loadTeamMembers(selectedTeam.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove team member');
    }
  };

  return {
    // State
    teams,
    selectedTeam,
    teamMembers,
    isLoading,
    showTeamForm,
    showMemberForm,
    editingTeam,
    editingMember,
    
    // Setters
    setSelectedTeam,
    setShowTeamForm,
    setShowMemberForm,
    setEditingTeam,
    setEditingMember,
    
    // Handlers
    handleCreateTeam,
    handleUpdateTeam,
    handleDeleteTeam,
    handleAddMember,
    handleUpdateMember,
    handleRemoveMember
  };
}