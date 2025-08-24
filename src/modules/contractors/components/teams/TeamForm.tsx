/**
 * TeamForm Component - Form for creating and editing contractor teams
 * Following FibreFlow patterns and keeping under 250 lines
 */

import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { TeamFormData, ContractorTeam } from '@/types/contractor.types';

interface TeamFormProps {
  team?: ContractorTeam;
  onSubmit: (data: TeamFormData) => Promise<void>;
  onCancel: () => void;
}

export function TeamForm({ team, onSubmit, onCancel }: TeamFormProps) {
  const [formData, setFormData] = useState<TeamFormData>({
    teamName: '',
    teamType: 'installation',
    specialization: '',
    maxCapacity: 5,
    baseLocation: '',
    operatingRadius: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team) {
      const updatedData: TeamFormData = {
        teamName: team.teamName,
        teamType: team.teamType,
        maxCapacity: team.maxCapacity
      };
      
      if (team.specialization !== undefined) updatedData.specialization = team.specialization;
      if (team.baseLocation !== undefined) updatedData.baseLocation = team.baseLocation;
      if (team.operatingRadius !== undefined) updatedData.operatingRadius = team.operatingRadius;
      
      setFormData(updatedData);
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teamName.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to save team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TeamFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {team ? 'Edit Team' : 'Create New Team'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Team Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => handleInputChange('teamName', e.target.value)}
                  required
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.teamType}
                  onChange={(e) => handleInputChange('teamType', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="installation">Installation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="survey">Survey</option>
                  <option value="testing">Testing</option>
                  <option value="splicing">Splicing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization || ''}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  placeholder="e.g., Aerial fiber, Underground cables"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Team Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 0)}
                  required
                  min={1}
                  max={50}
                  placeholder="Number of team members"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Coverage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Location
                </label>
                <input
                  type="text"
                  value={formData.baseLocation || ''}
                  onChange={(e) => handleInputChange('baseLocation', e.target.value)}
                  placeholder="City or area"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Radius (km)
                </label>
                <input
                  type="number"
                  value={formData.operatingRadius || ''}
                  onChange={(e) => handleInputChange('operatingRadius', parseInt(e.target.value) || 0)}
                  min={0}
                  max={500}
                  placeholder="Coverage radius in km"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.teamName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}