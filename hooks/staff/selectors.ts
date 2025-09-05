/**
 * Staff Selectors
 * Helper hooks for staff selection in forms and dropdowns
 */

import { StaffDropdownOption } from '@/types/staff.types';
import { useActiveStaff, useProjectManagers } from './queries';

/**
 * Helper hook for staff selection in forms
 */
export function useStaffSelection() {
  const { data: activeStaff = [], isLoading } = useActiveStaff();
  
  const getStaffById = (id: string): StaffDropdownOption | undefined => {
    return activeStaff.find(staff => staff.id === id);
  };
  
  const searchStaff = (searchTerm: string): StaffDropdownOption[] => {
    if (!searchTerm) return activeStaff;
    
    const term = searchTerm.toLowerCase();
    return activeStaff.filter(staff =>
      staff.name.toLowerCase().includes(term) ||
      staff.email.toLowerCase().includes(term) ||
      staff.position.toLowerCase().includes(term)
    );
  };
  
  return {
    staff: activeStaff,
    isLoading,
    getStaffById,
    searchStaff,
  };
}

/**
 * Helper hook for project manager selection
 */
export function useProjectManagerSelection() {
  const { data: projectManagers = [], isLoading } = useProjectManagers();
  
  const getProjectManagerById = (id: string): StaffDropdownOption | undefined => {
    return projectManagers.find(manager => manager.id === id);
  };
  
  const searchProjectManagers = (searchTerm: string): StaffDropdownOption[] => {
    if (!searchTerm) return projectManagers;
    
    const term = searchTerm.toLowerCase();
    return projectManagers.filter(manager =>
      manager.name.toLowerCase().includes(term) ||
      manager.email.toLowerCase().includes(term) ||
      manager.position.toLowerCase().includes(term)
    );
  };
  
  const getAvailableProjectManagers = (): StaffDropdownOption[] => {
    // Filter for project managers who aren't over their project limit
    return projectManagers.filter(manager => 
      manager.currentProjectCount < manager.maxProjectCount
    );
  };
  
  return {
    projectManagers,
    isLoading,
    getProjectManagerById,
    searchProjectManagers,
    getAvailableProjectManagers,
  };
}