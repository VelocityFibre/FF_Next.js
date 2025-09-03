import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useStaffMember, useCreateStaff, useUpdateStaff } from '@/hooks/useStaff';
import { 
  StaffFormData, 
  StaffStatus,
  ContractType,
  Skill 
} from '@/types/staff.types';
import { safeToDate } from '@/utils/dateHelpers';
import {
  PersonalInfoSection,
  EmploymentSection,
  EmergencyContactSection,
  AvailabilitySection,
  SkillsSection
} from './StaffFormSections';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Timestamp } from 'firebase/firestore';
import { log } from '@/lib/logger';

export function StaffForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: staff, isLoading } = useStaffMember(id || '', { enabled: !!id });
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();

  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    position: '',
    department: 'field_operations',
    status: StaffStatus.ACTIVE,
    skills: [],
    experienceYears: 0,
    address: '',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '',
    startDate: new Date(),
    contractType: ContractType.PERMANENT,
    workingHours: '08:00 - 17:00',
    availableWeekends: false,
    availableNights: false,
    timeZone: 'Africa/Johannesburg',
    maxProjectCount: 5
  });

  useEffect(() => {
    if (staff && isEditing) {
      const startDate = staff.startDate instanceof Timestamp 
        ? new Date(staff.startDate.seconds * 1000)
        : new Date(staff.startDate);

      const formUpdate: Partial<StaffFormData> = {
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        employeeId: staff.employeeId,
        position: typeof staff.position === 'string' ? staff.position : String(staff.position),
        department: typeof staff.department === 'string' ? staff.department : String(staff.department),
        status: staff.status,
        skills: staff.skills || [],
        experienceYears: staff.experienceYears || 0,
        address: staff.address,
        city: staff.city,
        province: staff.province,
        postalCode: staff.postalCode,
        startDate: startDate,
        contractType: staff.contractType,
        workingHours: staff.workingHours || '08:00 - 17:00',
        availableWeekends: staff.availableWeekends || false,
        availableNights: staff.availableNights || false,
        timeZone: staff.timeZone || 'Africa/Johannesburg',
        maxProjectCount: staff.maxProjectCount || 5
      };
      
      // Add optional fields only if they exist
      if (staff.id) formUpdate.id = staff.id;
      if (staff.alternativePhone) formUpdate.alternativePhone = staff.alternativePhone;
      if (staff.level) formUpdate.level = staff.level;
      if (staff.reportsTo) formUpdate.reportsTo = staff.reportsTo;
      if (staff.specializations) formUpdate.specializations = staff.specializations;
      if (staff.emergencyContactName) formUpdate.emergencyContactName = staff.emergencyContactName;
      if (staff.emergencyContactPhone) formUpdate.emergencyContactPhone = staff.emergencyContactPhone;
      if (staff.endDate) formUpdate.endDate = safeToDate(staff.endDate);
      if (staff.salaryGrade) formUpdate.salaryGrade = staff.salaryGrade;
      if (staff.hourlyRate !== undefined) formUpdate.hourlyRate = staff.hourlyRate;
      if (staff.notes) formUpdate.notes = staff.notes;
      if (staff.bio) formUpdate.bio = staff.bio;
      
      setFormData(prevData => ({ ...prevData, ...formUpdate }));
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
      log.error('Failed to save staff member:', { data: error }, 'StaffForm');
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
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading staff member..." />
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
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <PersonalInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <EmploymentSection 
            formData={formData} 
            handleInputChange={handleInputChange}
          />
          
          {/* Address section removed - handled in PersonalInfoSection */}
          
          <EmergencyContactSection 
            formData={formData} 
            handleInputChange={handleInputChange}
          />
          
          <AvailabilitySection 
            formData={formData} 
            handleInputChange={handleInputChange}
          />
          
          <SkillsSection 
            formData={formData}
            handleInputChange={handleInputChange}
            toggleSkill={toggleSkill}
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/app/staff')}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Staff Member' : 'Create Staff Member'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}