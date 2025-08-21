import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import { 
  StaffFormData, 
  StaffFilter,
  StaffDropdownOption,
  ProjectAssignment
} from '@/types/staff.types';

// Query Keys
export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filter?: StaffFilter) => [...staffKeys.lists(), { filter }] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  active: () => [...staffKeys.all, 'active'] as const,
  projectManagers: () => [...staffKeys.all, 'projectManagers'] as const,
  summary: () => [...staffKeys.all, 'summary'] as const,
  projectAssignments: (projectId: string) => [...staffKeys.all, 'assignments', projectId] as const,
};

// Queries

/**
 * Hook to fetch all staff with optional filtering
 */
export function useStaff(filter?: StaffFilter) {
  return useQuery({
    queryKey: staffKeys.list(filter),
    queryFn: () => staffService.getAll(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch active staff for dropdowns
 */
export function useActiveStaff() {
  return useQuery({
    queryKey: staffKeys.active(),
    queryFn: () => staffService.getActiveStaff(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch project managers for dropdowns
 */
export function useProjectManagers() {
  return useQuery({
    queryKey: staffKeys.projectManagers(),
    queryFn: () => staffService.getProjectManagers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a single staff member by ID
 */
export function useStaffMember(id: string) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => staffService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch staff summary statistics
 */
export function useStaffSummary() {
  return useQuery({
    queryKey: staffKeys.summary(),
    queryFn: () => staffService.getStaffSummary(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to fetch project assignments for a project
 */
export function useProjectAssignments(projectId: string) {
  return useQuery({
    queryKey: staffKeys.projectAssignments(projectId),
    queryFn: () => staffService.getProjectAssignments(projectId),
    enabled: !!projectId,
  });
}

// Mutations

/**
 * Hook to create a new staff member
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: StaffFormData) => staffService.create(data),
    onSuccess: () => {
      // Invalidate and refetch staff queries
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
    onError: (error: Error) => {
      console.error('Failed to create staff member:', error);
      throw error;
    },
  });
}

/**
 * Hook to update a staff member
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffFormData> }) => 
      staffService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific staff member and list queries
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.active() });
      queryClient.invalidateQueries({ queryKey: staffKeys.projectManagers() });
      queryClient.invalidateQueries({ queryKey: staffKeys.summary() });
    },
    onError: (error: Error) => {
      console.error('Failed to update staff member:', error);
      throw error;
    },
  });
}

/**
 * Hook to delete a staff member
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => staffService.delete(id),
    onSuccess: (_, id) => {
      // Remove staff member from cache and invalidate lists
      queryClient.removeQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.active() });
      queryClient.invalidateQueries({ queryKey: staffKeys.projectManagers() });
      queryClient.invalidateQueries({ queryKey: staffKeys.summary() });
    },
    onError: (error: Error) => {
      console.error('Failed to delete staff member:', error);
      throw error;
    },
  });
}

/**
 * Hook to assign staff to project
 */
export function useAssignStaffToProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignment: Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>) => 
      staffService.assignToProject(assignment),
    onSuccess: (_, assignment) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: staffKeys.projectAssignments(assignment.projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: staffKeys.detail(assignment.staffId) 
      });
      queryClient.invalidateQueries({ queryKey: staffKeys.active() });
      queryClient.invalidateQueries({ queryKey: staffKeys.summary() });
    },
    onError: (error: Error) => {
      console.error('Failed to assign staff to project:', error);
      throw error;
    },
  });
}

/**
 * Hook to update staff project count
 */
export function useUpdateStaffProjectCount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (staffId: string) => staffService.updateStaffProjectCount(staffId),
    onSuccess: (_, staffId) => {
      // Invalidate staff queries to show updated counts
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(staffId) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.active() });
      queryClient.invalidateQueries({ queryKey: staffKeys.summary() });
    },
    onError: (error: Error) => {
      console.error('Failed to update staff project count:', error);
      throw error;
    },
  });
}

// Custom Hooks for Staff Filter Management

/**
 * Hook to manage staff filter state
 */
export function useStaffFilters() {
  const [filter, setFilter] = React.useState<StaffFilter>({});
  
  const updateFilter = (newFilter: Partial<StaffFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };
  
  const clearFilter = () => {
    setFilter({});
  };
  
  const hasActiveFilters = Object.keys(filter).some(key => {
    const value = filter[key as keyof StaffFilter];
    return Array.isArray(value) ? value.length > 0 : !!value;
  });
  
  return {
    filter,
    updateFilter,
    clearFilter,
    hasActiveFilters,
  };
}

// Helper hook for staff selection in forms
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

// Helper hook for project manager selection
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