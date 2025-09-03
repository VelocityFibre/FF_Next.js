import { StaffFormData, Skill } from '@/types/staff.types';

interface SkillsSectionProps {
  formData: StaffFormData;
  handleInputChange: (field: keyof StaffFormData, value: any) => void;
  toggleSkill?: (skill: Skill) => void;
}

export function SkillsSection({ formData, toggleSkill, handleInputChange }: SkillsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Skills & Certifications</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Technical Skills
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(Skill).map(skill => (
            <label key={skill} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.skills.includes(skill)}
                onChange={() => toggleSkill?.(skill)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {skill.replace('_', ' ').charAt(0).toUpperCase() + skill.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Specializations (comma-separated)
        </label>
        <input
          type="text"
          value={(formData.specializations || []).join(', ')}
          onChange={(e) => handleInputChange('specializations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="e.g., GPON, Aerial Installation, Splicing"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}