/**
 * Staff Data Mappers
 * Functions to transform database results to domain models
 */

import { StaffMember, StaffDropdownOption } from '@/types/staff.types';

/**
 * Map database result to StaffMember
 */
export function mapToStaffMember(staff: any): StaffMember {
  return {
    id: staff.id,
    name: staff.name || '',
    email: staff.email || '',
    phone: staff.phone || '',
    position: staff.position || '',
    department: staff.department || '',
    status: staff.status || 'ACTIVE',
    employeeId: staff.employee_id || '',
    managerName: staff.manager_name || '',
    managerPosition: staff.manager_position || '',
    startDate: staff.join_date || new Date(),
    alternativePhone: staff.alternate_phone || '',
    contractType: staff.type || 'PERMANENT',
    createdAt: staff.created_at || new Date(),
    updatedAt: staff.updated_at || new Date(),
    createdBy: staff.created_by || '',
    lastModifiedBy: staff.last_modified_by || '',
    
    // Skills and Experience
    experienceYears: staff.experience_years || 0,
    specializations: staff.specializations || [],
    
    // Availability and Scheduling
    workingHours: staff.working_hours || '',
    availableWeekends: staff.available_weekends ?? false,
    availableNights: staff.available_nights ?? false,
    timeZone: staff.time_zone || 'UTC',
    
    // Project Management
    activeProjectIds: staff.active_project_ids || [],
    currentProjectCount: staff.current_project_count || 0,
    maxProjectCount: staff.max_project_count || 5,
    
    // Performance Metrics
    totalProjectsCompleted: staff.total_projects_completed || 0,
    averageProjectRating: staff.average_project_rating || 0,
    onTimeCompletionRate: staff.on_time_completion_rate || 0,
    
    // Management Hierarchy
    managerId: staff.manager_id,
    reportsTo: staff.reports_to,
    level: staff.level,
    
    // Equipment and Tools
    assignedEquipment: staff.assigned_equipment || [],
    vehicleAssigned: staff.vehicle_assigned,
    toolsAssigned: staff.tools_assigned || [],
    
    // Training and Development
    trainingRecords: staff.training_records || [],
    nextTrainingDue: staff.next_training_due,
    safetyTrainingExpiry: staff.safety_training_expiry,
    
    // Employment Terms
    endDate: staff.end_date,
    salaryGrade: staff.salary_grade,
    hourlyRate: staff.hourly_rate,
    
    // Required fields with defaults
    // joinDate is mapped to startDate above
    managerEmployeeId: staff.manager_employee_id || '',
    isActive: staff.is_active ?? true,
    lastActiveDate: staff.last_active_date,
    profilePhotoUrl: staff.profile_image_url,
    emergencyContactName: staff.emergency_contact_name || '',
    emergencyContactPhone: staff.emergency_contact_phone || '',
    address: staff.address || '',
    city: staff.city || '',
    province: staff.province || '',
    postalCode: staff.postal_code || '',
    taxNumber: staff.tax_number || '',
    bankAccountNumber: staff.bank_account_number || '',
    bankName: staff.bank_name || '',
    salaryAmount: staff.salary_amount || 0,
    benefitsPackage: staff.benefits_package || '',
    workLocation: staff.work_location || '',
    workSchedule: staff.work_schedule || '',
    skills: staff.skills || [],
    certifications: staff.certifications || [],
    performanceRating: staff.performance_rating || 0,
    performanceNotes: staff.performance_notes || '',
    bio: staff.bio,
    notes: staff.notes || ''
  };
}

/**
 * Map database results to StaffMember array with manager info
 */
export function mapToStaffMembers(results: any[]): StaffMember[] {
  return results.map((staff: any) => ({
    ...staff,
    managerName: staff.manager_name,
    managerPosition: staff.manager_position
  })) as StaffMember[];
}

/**
 * Map database result to StaffDropdownOption
 */
export function mapToDropdownOption(staff: any, isManager: boolean = false): StaffDropdownOption {
  return {
    id: staff.id,
    name: staff.name,
    position: staff.position,
    department: staff.department || (isManager ? 'Management' : undefined),
    email: staff.email,
    status: 'ACTIVE' as any, // Type will be fixed when we properly implement enums
    currentProjectCount: 0, // TODO: Calculate from projects
    maxProjectCount: isManager ? 10 : 5 // Managers can handle more projects
  };
}