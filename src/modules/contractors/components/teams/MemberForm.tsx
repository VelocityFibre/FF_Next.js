/**
 * MemberForm Component - Form for adding and editing team members
 * Following FibreFlow patterns and keeping under 250 lines
 */

import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { MemberFormData, TeamMember } from '@/types/contractor.types';
import { UniversalField } from '@/components/forms/UniversalField';

interface MemberFormProps {
  member?: TeamMember;
  onSubmit: (data: MemberFormData) => Promise<void>;
  onCancel: () => void;
}

export function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    phone: '',
    role: '',
    skillLevel: 'intermediate',
    certifications: [],
    specialSkills: [],
    employmentType: 'permanent',
    hourlyRate: undefined,
    dailyRate: undefined,
    isTeamLead: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        idNumber: member.idNumber || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role,
        skillLevel: member.skillLevel,
        certifications: member.certifications || [],
        specialSkills: member.specialSkills || [],
        employmentType: member.employmentType,
        hourlyRate: member.hourlyRate,
        dailyRate: member.dailyRate,
        isTeamLead: member.isTeamLead,
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.role.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to save member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'certifications' | 'specialSkills', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {member ? 'Edit Team Member' : 'Add Team Member'}
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
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UniversalField
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={(value: string) => handleInputChange('firstName', value)}
                required
                placeholder="Enter first name"
              />
              
              <UniversalField
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(value: string) => handleInputChange('lastName', value)}
                required
                placeholder="Enter last name"
              />
              
              <UniversalField
                label="ID Number"
                type="text"
                value={formData.idNumber}
                onChange={(value: string) => handleInputChange('idNumber', value)}
                placeholder="South African ID number"
              />
              
              <UniversalField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value: string) => handleInputChange('email', value)}
                placeholder="email@example.com"
              />
              
              <UniversalField
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(value: string) => handleInputChange('phone', value)}
                placeholder="0821234567"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UniversalField
                label="Role"
                type="text"
                value={formData.role}
                onChange={(value: string) => handleInputChange('role', value)}
                required
                placeholder="e.g., Fiber Technician, Site Supervisor"
              />
              
              <UniversalField
                label="Skill Level"
                type="select"
                value={formData.skillLevel}
                onChange={(value: string) => handleInputChange('skillLevel', value)}
                required
                options={[
                  { value: 'junior', label: 'Junior' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'expert', label: 'Expert' }
                ]}
              />
              
              <UniversalField
                label="Employment Type"
                type="select"
                value={formData.employmentType}
                onChange={(value: string) => handleInputChange('employmentType', value)}
                required
                options={[
                  { value: 'permanent', label: 'Permanent' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'temporary', label: 'Temporary' }
                ]}
              />
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isTeamLead"
                  checked={formData.isTeamLead}
                  onChange={(e) => handleInputChange('isTeamLead', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isTeamLead" className="ml-2 text-sm font-medium text-gray-700">
                  Team Lead
                </label>
              </div>
            </div>
          </div>

          {/* Skills & Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <UniversalField
                label="Certifications"
                type="text"
                value={formData.certifications?.join(', ') || ''}
                onChange={(value: string) => handleArrayInputChange('certifications', value)}
                placeholder="Comma-separated list"
              />
            </div>
            
            <div>
              <UniversalField
                label="Special Skills"
                type="text"
                value={formData.specialSkills?.join(', ') || ''}
                onChange={(value: string) => handleArrayInputChange('specialSkills', value)}
                placeholder="Comma-separated list"
              />
            </div>
            
            <div>
              <UniversalField
                label="Hourly Rate (ZAR)"
                type="number"
                value={formData.hourlyRate}
                onChange={(value: number) => handleInputChange('hourlyRate', value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            
            <div>
              <UniversalField
                label="Daily Rate (ZAR)"
                type="number"
                value={formData.dailyRate}
                onChange={(value: number) => handleInputChange('dailyRate', value)}
                placeholder="0.00"
                step="0.01"
              />
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
              disabled={isSubmitting || !formData.firstName.trim() || !formData.lastName.trim() || !formData.role.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}