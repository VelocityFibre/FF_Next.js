/**
 * TeamManagement Component - Comprehensive team management for contractors
 * Following FibreFlow patterns with full CRUD operations for teams and members
 */

import { useState, useEffect } from 'react';
import { Plus, Users, User, Edit, Trash2, Star, AlertCircle } from 'lucide-react';
import { contractorService } from '@/services/contractorService';
import { ContractorTeam, TeamMember, TeamFormData, MemberFormData } from '@/types/contractor.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TeamForm } from './TeamForm';
import { MemberForm } from './MemberForm';
import toast from 'react-hot-toast';

interface TeamManagementProps {
  contractorId: string;
  contractorName: string;
}

export function TeamManagement({ contractorId, contractorName }: TeamManagementProps) {
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

  const getTeamTypeColor = (type: string) => {
    const colors = {
      installation: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-green-100 text-green-800',
      survey: 'bg-purple-100 text-purple-800',
      testing: 'bg-orange-100 text-orange-800',
      splicing: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSkillLevelColor = (level: string) => {
    const colors = {
      junior: 'bg-yellow-100 text-yellow-800',
      intermediate: 'bg-blue-100 text-blue-800',
      senior: 'bg-green-100 text-green-800',
      expert: 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" label="Loading teams..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage teams and members for {contractorName}</p>
        </div>
        <button
          onClick={() => setShowTeamForm(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Team
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Teams ({teams.length})</h3>
          
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No teams found</p>
              <button
                onClick={() => setShowTeamForm(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first team
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    selectedTeam?.id === team.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{team.teamName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTeamTypeColor(team.teamType)}`}>
                          {team.teamType}
                        </span>
                        <span className="text-sm text-gray-500">
                          {team.currentCapacity}/{team.maxCapacity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTeam(team);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeam(team.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Details & Members */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeam ? (
            <>
              {/* Team Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedTeam.teamName}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${getTeamTypeColor(selectedTeam.teamType)}`}>
                      {selectedTeam.teamType}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      selectedTeam.availability === 'available' 
                        ? 'bg-green-100 text-green-800'
                        : selectedTeam.availability === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedTeam.availability}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedTeam.currentCapacity}</p>
                    <p className="text-sm text-gray-600">Current</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedTeam.maxCapacity}</p>
                    <p className="text-sm text-gray-600">Max Capacity</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{selectedTeam.availableCapacity}</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{selectedTeam.efficiency || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Efficiency</p>
                  </div>
                </div>

                {selectedTeam.specialization && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Specialization</p>
                    <p className="text-gray-900">{selectedTeam.specialization}</p>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Team Members ({teamMembers.length})
                  </h3>
                  <button
                    onClick={() => setShowMemberForm(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </button>
                </div>

                {teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No team members found</p>
                    <button
                      onClick={() => setShowMemberForm(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add the first member
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                            {member.isTeamLead && (
                              <Star className="w-3 h-3 text-yellow-500 absolute translate-x-2 -translate-y-2" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                              {member.isTeamLead && (
                                <span className="ml-2 text-xs text-yellow-600 font-medium">LEAD</span>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">{member.role}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getSkillLevelColor(member.skillLevel)}`}>
                                {member.skillLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingMember(member)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Selected</h3>
              <p className="text-gray-600">Select a team from the list to view details and manage members.</p>
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      {showTeamForm && (
        <TeamForm
          onSubmit={handleCreateTeam}
          onCancel={() => setShowTeamForm(false)}
        />
      )}

      {editingTeam && (
        <TeamForm
          team={editingTeam}
          onSubmit={(data) => handleUpdateTeam(editingTeam.id, data)}
          onCancel={() => setEditingTeam(null)}
        />
      )}

      {showMemberForm && selectedTeam && (
        <MemberForm
          onSubmit={handleAddMember}
          onCancel={() => setShowMemberForm(false)}
        />
      )}

      {editingMember && (
        <MemberForm
          member={editingMember}
          onSubmit={(data) => handleUpdateMember(editingMember.id, data)}
          onCancel={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}