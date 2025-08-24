import { ContractorTeam } from '@/types/contractor.types';
import { getTeamTypeColor } from '../utils/teamHelpers';

interface TeamDetailsProps {
  team: ContractorTeam;
}

export function TeamDetails({ team }: TeamDetailsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{team.teamName}</h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm rounded-full ${getTeamTypeColor(team.teamType)}`}>
            {team.teamType}
          </span>
          <span className={`px-3 py-1 text-sm rounded-full ${
            team.availability === 'available' 
              ? 'bg-green-100 text-green-800'
              : team.availability === 'busy'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {team.availability}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{team.currentCapacity}</p>
          <p className="text-sm text-gray-600">Current</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{team.maxCapacity}</p>
          <p className="text-sm text-gray-600">Max Capacity</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{team.availableCapacity}</p>
          <p className="text-sm text-gray-600">Available</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{team.efficiency || 'N/A'}</p>
          <p className="text-sm text-gray-600">Efficiency</p>
        </div>
      </div>

      {team.specialization && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Specialization</p>
          <p className="text-gray-900">{team.specialization}</p>
        </div>
      )}
    </div>
  );
}