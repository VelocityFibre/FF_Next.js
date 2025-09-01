/**
 * Staff Queries
 * Query hooks for staff data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import { StaffFilter } from '@/types/staff.types';
import { staffKeys } from './queryKeys';

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
export function useStaffMember(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => staffService.getById(id),
    enabled: options?.enabled !== false && !!id,
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
    queryFn: () => staffService.getProjectAssignments(),
    enabled: !!projectId,
  });
}