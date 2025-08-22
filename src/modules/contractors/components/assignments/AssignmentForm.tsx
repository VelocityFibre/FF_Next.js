/**
 * AssignmentForm Component - Form for creating project assignments
 * Following FibreFlow patterns and keeping under 250 lines
 */

import { useState } from 'react';
import { X, Briefcase } from 'lucide-react';
import { ContractorTeam } from '@/types/contractor.types';
import { UniversalField } from '@/components/forms/UniversalField';

interface AssignmentFormData {
  projectId: string;
  teamId?: string;
  assignmentType: 'primary' | 'subcontractor' | 'consultant' | 'specialist';
  scope: string;
  responsibilities: string[];
  startDate: string;
  endDate: string;
  contractValue: number;
  assignmentNotes?: string;
}

interface AssignmentFormProps {
  contractorId: string;
  teams: ContractorTeam[];
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  onCancel: () => void;
}

export function AssignmentForm({ contractorId, teams, onSubmit, onCancel }: AssignmentFormProps) {
  const [formData, setFormData] = useState<AssignmentFormData>({
    projectId: '',
    teamId: '',
    assignmentType: 'primary',
    scope: '',
    responsibilities: [],
    startDate: '',
    endDate: '',
    contractValue: 0,
    assignmentNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId.trim() || !formData.scope.trim() || formData.contractValue <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to create assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AssignmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResponsibilitiesChange = (value: string) => {
    const responsibilities = value.split('\n').map(r => r.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, responsibilities }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">New Project Assignment</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project & Team Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UniversalField
                label="Project ID"
                type="text"
                value={formData.projectId}
                onChange={(value: string) => handleInputChange('projectId', value)}
                required
                placeholder="Enter project identifier"
              />
              
              <UniversalField
                label="Assignment Type"
                type="select"
                value={formData.assignmentType}
                onChange={(value: string) => handleInputChange('assignmentType', value)}
                required
                options={[
                  { value: 'primary', label: 'Primary Contractor' },
                  { value: 'subcontractor', label: 'Subcontractor' },
                  { value: 'consultant', label: 'Consultant' },
                  { value: 'specialist', label: 'Specialist' }
                ]}
              />
              
              {teams.length > 0 && (
                <UniversalField
                  label="Assigned Team (Optional)"
                  type="select"
                  value={formData.teamId}
                  onChange={(value: string) => handleInputChange('teamId', value)}
                  options={[
                    { value: '', label: 'No specific team' },
                    ...teams.map(team => ({
                      value: team.id,
                      label: `${team.teamName} (${team.teamType})`
                    }))
                  ]}
                />
              )}
            </div>
          </div>

          {/* Scope & Responsibilities */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Work Details</h3>
            <div className="space-y-4">
              <UniversalField
                label="Scope of Work"
                type="textarea"
                value={formData.scope}
                onChange={(value: string) => handleInputChange('scope', value)}
                required
                rows={3}
                placeholder="Describe the scope of work for this assignment"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Responsibilities (one per line)
                </label>
                <textarea
                  value={formData.responsibilities.join('\n')}
                  onChange={(e) => handleResponsibilitiesChange(e.target.value)}
                  rows={4}
                  placeholder="Enter key responsibilities, one per line"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Timeline & Financial */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline & Contract</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UniversalField
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(value: string) => handleInputChange('startDate', value)}
                required
              />
              
              <UniversalField
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(value: string) => handleInputChange('endDate', value)}
                required
              />
              
              <UniversalField
                label="Contract Value (ZAR)"
                type="number"
                value={formData.contractValue}
                onChange={(value: number) => handleInputChange('contractValue', value)}
                required
                min={0}
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <UniversalField
              label="Assignment Notes"
              type="textarea"
              value={formData.assignmentNotes}
              onChange={(value: string) => handleInputChange('assignmentNotes', value)}
              rows={3}
              placeholder="Additional notes or special instructions"
            />
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
              disabled={isSubmitting || !formData.projectId.trim() || !formData.scope.trim() || formData.contractValue <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}