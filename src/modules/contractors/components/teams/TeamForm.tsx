/**
 * TeamForm Component - Form for creating and editing teams
 * Following FibreFlow patterns and keeping under 250 lines
 */

import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { TeamFormData, ContractorTeam } from '@/types/contractor.types';
import { UniversalField } from '@/components/forms/UniversalField';

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
      setFormData({
        teamName: team.teamName,
        teamType: team.teamType,
        specialization: team.specialization || '',
        maxCapacity: team.maxCapacity,
        baseLocation: team.baseLocation || '',
        operatingRadius: team.operatingRadius || 50,
      });
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
              {team ? 'Edit Team' : 'Add New Team'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UniversalField
              label="Team Name"
              type="text"
              value={formData.teamName}
              onChange={(value: string) => handleInputChange('teamName', value)}
              required
              placeholder="Enter team name"
            />
            
            <UniversalField
              label="Team Type"
              type="select"
              value={formData.teamType}
              onChange={(value: string) => handleInputChange('teamType', value)}
              required
              options={[
                { value: 'installation', label: 'Installation' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'survey', label: 'Survey' },
                { value: 'testing', label: 'Testing' },
                { value: 'splicing', label: 'Splicing' }
              ]}
            />
          </div>

          <UniversalField
            label="Specialization"
            type="text"
            value={formData.specialization}
            onChange={(value: string) => handleInputChange('specialization', value)}
            placeholder="e.g., Fiber optic installation, Underground cabling"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UniversalField
              label="Maximum Capacity"
              type="number"
              value={formData.maxCapacity}
              onChange={(value: number) => handleInputChange('maxCapacity', value)}
              required
              min={1}
              max={50}
              placeholder="Number of team members"
            />
            
            <UniversalField
              label="Operating Radius (km)"
              type="number"
              value={formData.operatingRadius}
              onChange={(value: number) => handleInputChange('operatingRadius', value)}
              min={5}
              max={500}
              placeholder="Coverage area radius"
            />
          </div>

          <UniversalField
            label="Base Location"
            type="text"
            value={formData.baseLocation}
            onChange={(value: string) => handleInputChange('baseLocation', value)}
            placeholder="Primary operating location"
          />

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