import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useStaffMember, useCreateStaff, useUpdateStaff } from '@/hooks/useStaff';
import { 
  StaffFormData, 
  Department, 
  Position,
  StaffStatus, 
  ContractType,
  Skill 
} from '@/types/staff.types';

export function StaffForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: staff, isLoading } = useStaffMember(id || '');
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();

  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
    alternativePhone: '',
    employeeId: '',
    position: Position.FIELD_TECHNICIAN,
    department: Department.OPERATIONS,
    status: StaffStatus.ACTIVE,
    skills: [],
    experienceYears: 0,
    address: '',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    startDate: new Date(),
    contractType: ContractType.PERMANENT,
    workingHours: '08:00 - 17:00',
    availableWeekends: false,
    availableNights: false,
    timeZone: 'Africa/Johannesburg',
    maxProjectCount: 5,
  });

  useEffect(() => {
    if (staff && isEditing) {
      const formDataUpdate: StaffFormData = {
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        alternativePhone: staff.alternativePhone || '',
        employeeId: staff.employeeId,
        position: staff.position,
        department: staff.department,
        status: staff.status,
        skills: staff.skills,
        experienceYears: staff.experienceYears,
        address: staff.address,
        city: staff.city,
        province: staff.province,
        postalCode: staff.postalCode,
        emergencyContactName: staff.emergencyContactName || '',
        emergencyContactPhone: staff.emergencyContactPhone || '',
        startDate: typeof staff.startDate === 'object' && 'toDate' in staff.startDate 
          ? (staff.startDate as any).toDate() 
          : new Date(staff.startDate),
        contractType: staff.contractType,
        workingHours: staff.workingHours,
        availableWeekends: staff.availableWeekends,
        availableNights: staff.availableNights,
        timeZone: staff.timeZone,
        maxProjectCount: staff.maxProjectCount,
        managerId: staff.reportsTo || '',
      };

      // Add optional fields only if they exist
      if (staff.endDate) {
        formDataUpdate.endDate = typeof staff.endDate === 'object' && 'toDate' in staff.endDate 
          ? (staff.endDate as any).toDate() 
          : new Date(staff.endDate);
      }
      if (staff.hourlyRate !== undefined) {
        formDataUpdate.hourlyRate = staff.hourlyRate;
      }
      if (staff.salaryGrade) {
        formDataUpdate.salaryGrade = staff.salaryGrade;
      }

      setFormData(formDataUpdate);
    }
  }, [staff, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: id!, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/app/staff');
    } catch (error) {
      console.error('Failed to save staff member:', error);
    }
  };

  const handleInputChange = (field: keyof StaffFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: Skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/staff')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Staff List
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
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
                  Employee ID
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  placeholder="Auto-generated if left empty"
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
            </div>
          </div>

          {/* Job Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(Position).map(pos => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value as Department)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>
                      {dept.replace('_', ' ').charAt(0).toUpperCase() + dept.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
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
                  Contract Type
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
                  Max Projects
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxProjectCount}
                  onChange={(e) => handleInputChange('maxProjectCount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Skills</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(Skill).map(skill => (
                <label key={skill} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {skill.replace(/_/g, ' ').charAt(0).toUpperCase() + skill.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/app/staff')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update' : 'Create'} Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}