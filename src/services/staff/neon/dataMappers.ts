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
    // Required fields with defaults
    joinDate: staff.join_date || new Date(),
    managerEmployeeId: staff.manager_employee_id || '',
    isActive: staff.is_active ?? true,
    lastActiveDate: staff.last_active_date,
    profileImageUrl: staff.profile_image_url,
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