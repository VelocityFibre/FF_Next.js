/**
 * MemberForm Component - Form for adding and editing team members
 * Following FibreFlow patterns and keeping under 250 lines
 */

import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { MemberFormData, TeamMember } from '@/types/contractor.types';
import { log } from '@/lib/logger';

interface MemberFormProps {
  member?: TeamMember;
  onSubmit: (data: MemberFormData) => Promise<void>;
  onCancel: () => void;
}

export function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    role: '',
    skillLevel: 'intermediate',
    employmentType: 'permanent',
    isTeamLead: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      const updatedData: MemberFormData = {
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        skillLevel: member.skillLevel,
        employmentType: member.employmentType,
        isTeamLead: member.isTeamLead
      };
      
      if (member.idNumber !== undefined) updatedData.idNumber = member.idNumber;
      if (member.email !== undefined) updatedData.email = member.email;
      if (member.phone !== undefined) updatedData.phone = member.phone;
      if (member.certifications !== undefined) updatedData.certifications = member.certifications;
      if (member.specialSkills !== undefined) updatedData.specialSkills = member.specialSkills;
      if (member.hourlyRate !== undefined) updatedData.hourlyRate = member.hourlyRate;
      if (member.dailyRate !== undefined) updatedData.dailyRate = member.dailyRate;
      
      setFormData(updatedData);
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
      log.error('Failed to save member:', { data: error }, 'MemberForm');
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber || ''}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  placeholder="South African ID number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="0821234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                  placeholder="e.g., Fiber Technician, Site Supervisor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="senior">Senior</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
              
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
              <input
                type="text"
                value={formData.certifications?.join(', ') || ''}
                onChange={(e) => handleArrayInputChange('certifications', e.target.value)}
                placeholder="Comma-separated list"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Skills</label>
              <input
                type="text"
                value={formData.specialSkills?.join(', ') || ''}
                onChange={(e) => handleArrayInputChange('specialSkills', e.target.value)}
                placeholder="Comma-separated list"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (ZAR)</label>
              <input
                type="number"
                value={formData.hourlyRate || ''}
                onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (ZAR)</label>
              <input
                type="number"
                value={formData.dailyRate || ''}
                onChange={(e) => handleInputChange('dailyRate', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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