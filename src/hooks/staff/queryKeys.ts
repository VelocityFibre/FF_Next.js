/**
 * Staff Query Keys
 * Centralized query key definitions for staff-related queries
 */

import { StaffFilter } from '@/types/staff.types';

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