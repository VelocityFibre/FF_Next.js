/**
 * Staff Hooks - Legacy Compatibility Layer
 * @deprecated Use imports from @/hooks/staff/ instead
 * 
 * This file provides backward compatibility for existing imports.
 * New code should import directly from the modular structure:
 * - import { useStaff, staffKeys } from '@/hooks/staff'
 * 
 * Original file: 306 lines → Split into focused modules
 */

// Re-export everything from the new modular structure
export {
  // Query Keys
  staffKeys,
  
  // Query Hooks
  useStaff,
  useActiveStaff,
  useProjectManagers,
  useStaffMember,
  useStaffSummary,
  useProjectAssignments,
  
  // Mutation Hooks
  useCreateStaff,
  useCreateOrUpdateStaff,
  useUpdateStaff,
  useDeleteStaff,
  useAssignStaffToProject,
  useUpdateStaffProjectCount,
  
  // Filter Hooks
  useStaffFilters,
  
  // Selection Hooks
  useStaffSelection,
  useProjectManagerSelection,
} from '@/hooks/staff';