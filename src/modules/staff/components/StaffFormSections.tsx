import { 
  StaffFormData, 
  StaffLevel,
  StaffStatus,
  ContractType,
  Skill
} from '@/types/staff.types';
import { 
  StaffPosition, 
  StaffDepartment,
  getPositionsByDepartment 
} from '@/types/staff-hierarchy.types';
import { useStaff } from '@/hooks/useStaff';

interface SectionProps {
  formData: StaffFormData;
  handleInputChange: (field: keyof StaffFormData, value: any) => void;
  toggleSkill?: (skill: Skill) => void;
}

export function PersonalInfoSection({ formData, handleInputChange }: SectionProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee ID *
          </label>
          <input
            type="text"
            required
            value={formData.employeeId}
            onChange={(e) => handleInputChange('employeeId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternative Phone
          </label>
          <input
            type="tel"
            value={formData.alternativePhone}
            onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export function EmploymentSection({ formData, handleInputChange }: SectionProps) {
  const { data: staffList } = useStaff(); // Get all staff for Reports To dropdown
  
  // Filter positions based on selected department
  const availablePositions = formData.department 
    ? getPositionsByDepartment(formData.department)
    : Object.values(StaffPosition);

  // Get potential managers (exclude current staff member if editing)
  const potentialManagers = staffList?.filter(staff => 
    staff.id !== formData.id && 
    ['MD', 'CCSO', 'BDO', 'Head', 'Manager'].some(title => 
      staff.position?.includes(title)
    )
  ) || [];

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department *
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Department</option>
            {Object.values(StaffDepartment).map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position *
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Position</option>
            {availablePositions.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reports To
          </label>
          <select
            value={formData.reportsTo || ''}
            onChange={(e) => handleInputChange('reportsTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Direct Manager</option>
            {potentialManagers.map(manager => (
              <option key={manager.id} value={manager.id}>
                {manager.name} - {manager.position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <select
            value={formData.level}
            onChange={(e) => handleInputChange('level', e.target.value as StaffLevel)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Level</option>
            {Object.values(StaffLevel).map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as StaffStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(StaffStatus).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contract Type *
          </label>
          <select
            value={formData.contractType}
            onChange={(e) => handleInputChange('contractType', e.target.value as ContractType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(ContractType).map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Years
          </label>
          <input
            type="number"
            min="0"
            value={formData.experienceYears}
            onChange={(e) => handleInputChange('experienceYears', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            required
            value={formData.startDate instanceof Date && !isNaN(formData.startDate.getTime()) ? formData.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.hourlyRate}
            onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export function AddressSection({ formData, handleInputChange }: SectionProps) {
  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province *
          </label>
          <select
            value={formData.province}
            onChange={(e) => handleInputChange('province', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {provinces.map(province => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code *
          </label>
          <input
            type="text"
            required
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export function EmergencyContactSection({ formData, handleInputChange }: SectionProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Name
          </label>
          <input
            type="text"
            value={formData.emergencyContactName}
            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export function AvailabilitySection({ formData, handleInputChange }: SectionProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Availability & Scheduling</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Working Hours
          </label>
          <input
            type="text"
            value={formData.workingHours}
            onChange={(e) => handleInputChange('workingHours', e.target.value)}
            placeholder="e.g., 8:00 AM - 5:00 PM"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Project Count
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxProjectCount}
            onChange={(e) => handleInputChange('maxProjectCount', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.availableWeekends}
              onChange={(e) => handleInputChange('availableWeekends', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Available Weekends</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.availableNights}
              onChange={(e) => handleInputChange('availableNights', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Available Nights</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export function SkillsSection({ formData, toggleSkill, handleInputChange }: SectionProps) {
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
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}