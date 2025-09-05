/**
 * Staff Hooks
 * Centralized exports for all staff-related hooks
 */

// Query Keys
export { staffKeys } from './queryKeys';

// Query Hooks
export {
  useStaff,
  useActiveStaff,
  useProjectManagers,
  useStaffMember,
  useStaffSummary,
  useProjectAssignments,
} from './queries';

// Mutation Hooks
export {
  useCreateStaff,
  useCreateOrUpdateStaff,
  useUpdateStaff,
  useDeleteStaff,
  useAssignStaffToProject,
  useUpdateStaffProjectCount,
} from './mutations';

// Filter Hooks
export { useStaffFilters } from './filters';

// Selection Hooks
export {
  useStaffSelection,
  useProjectManagerSelection,
} from './selectors';