import { Users, Edit, Trash2 } from 'lucide-react';
import { ContractorTeam } from '@/types/contractor.types';
import { getTeamTypeColor } from '../utils/teamHelpers';

interface TeamsListProps {
  teams: ContractorTeam[];
  selectedTeam: ContractorTeam | null;
  onSelectTeam: (team: ContractorTeam) => void;
  onEditTeam: (team: ContractorTeam) => void;
  onDeleteTeam: (teamId: string) => void;
  onCreateTeam: () => void;
}

export function TeamsList({
  teams,
  selectedTeam,
  onSelectTeam,
  onEditTeam,
  onDeleteTeam,
  onCreateTeam
}: TeamsListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Teams ({teams.length})</h3>
      
      {teams.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No teams found</p>
          <button
            onClick={onCreateTeam}
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
              onClick={() => onSelectTeam(team)}
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
                      onEditTeam(team);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTeam(team.id);
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
  );
}