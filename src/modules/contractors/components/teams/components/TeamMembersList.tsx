import { Plus, User, Edit, Trash2, Star } from 'lucide-react';
import { TeamMember } from '@/types/contractor.types';
import { getSkillLevelColor } from '../utils/teamHelpers';

interface TeamMembersListProps {
  members: TeamMember[];
  onAddMember: () => void;
  onEditMember: (member: TeamMember) => void;
  onRemoveMember: (memberId: string) => void;
}

export function TeamMembersList({
  members,
  onAddMember,
  onEditMember,
  onRemoveMember
}: TeamMembersListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Team Members ({members.length})
        </h3>
        <button
          onClick={onAddMember}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No team members found</p>
          <button
            onClick={onAddMember}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add the first member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center relative">
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
                  onClick={() => onEditMember(member)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveMember(member.id)}
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
  );
}