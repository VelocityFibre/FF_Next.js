/**
 * Staff Neon Service Module
 * Central exports for staff service using Neon PostgreSQL
 */

import { 
  StaffMember, 
  StaffFormData,
  StaffFilter,
  StaffSummary,
  StaffDropdownOption
} from '@/types/staff.types';
import { queryStaffWithFilters, queryStaffById, queryActiveStaff, queryProjectManagers } from './queryBuilders';
import { mapToStaffMember, mapToStaffMembers, mapToDropdownOption } from './dataMappers';
import { createStaff, createOrUpdateStaff, updateStaff, deleteStaff } from './crudOperations';
import { getStaffSummary as getStaffSummaryStats } from './statistics';

/**
 * Staff service using Neon PostgreSQL database
 */
export const staffNeonService = {
  /**
   * Get all staff with optional filtering
   */
  async getAll(filter?: StaffFilter): Promise<StaffMember[]> {
    try {
      const result = await queryStaffWithFilters(filter);
      return mapToStaffMembers(result);
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  /**
   * Get staff member by ID
   */
  async getById(id: string): Promise<StaffMember | null> {
    try {
      const result = await queryStaffById(id);
      
      if (result.length === 0) return null;
      
      return mapToStaffMember(result[0]);
    } catch (error) {
      console.error('Error fetching staff member:', error);
      throw error;
    }
  },

  /**
   * Create new staff member
   */
  create: createStaff,

  /**
   * Create or update staff member by employee ID (upsert operation)
   */
  createOrUpdate: createOrUpdateStaff,

  /**
   * Update staff member
   */
  update: updateStaff,

  /**
   * Delete staff member
   */
  delete: deleteStaff,

  /**
   * Get active staff for dropdowns
   */
  async getActiveStaff(): Promise<StaffDropdownOption[]> {
    try {
      const result = await queryActiveStaff();
      return result.map((staff: any) => mapToDropdownOption(staff));
    } catch (error) {
      console.error('Error fetching active staff:', error);
      throw error;
    }
  },

  /**
   * Get project managers for dropdowns
   */
  async getProjectManagers(): Promise<StaffDropdownOption[]> {
    try {
      const result = await queryProjectManagers();
      return result.map((staff: any) => mapToDropdownOption(staff, true));
    } catch (error) {
      console.error('Error fetching project managers:', error);
      throw error;
    }
  },

  /**
   * Get staff summary statistics
   */
  getStaffSummary: getStaffSummaryStats
};

// Export all sub-modules for direct access if needed
export * from './queryBuilders';
export * from './dataMappers';
export * from './validators';
export * from './crudOperations';
export * from './statistics';