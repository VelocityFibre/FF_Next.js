import { 
  StaffFormData, 
  StaffLevel,
  StaffStatus,
  ContractType
} from '@/types/staff.types';
import { 
  StaffPosition, 
  StaffDepartment,
  getPositionsByDepartment 
} from '@/types/staff-hierarchy.types';
import { useStaff } from '@/hooks/useStaff';

interface EmploymentSectionProps {
  formData: StaffFormData;
  handleInputChange: (field: keyof StaffFormData, value: any) => void;
}

export function EmploymentSection({ formData, handleInputChange }: EmploymentSectionProps) {
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
            Position
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            required
          >
            <option value="">Select Status</option>
            {Object.values(StaffStatus).map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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
            required
          >
            <option value="">Select Contract Type</option>
            {Object.values(ContractType).map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            required
            value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Years
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.experienceYears}
            onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Project Count
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={formData.maxProjectCount}
            onChange={(e) => handleInputChange('maxProjectCount', parseInt(e.target.value) || 5)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}