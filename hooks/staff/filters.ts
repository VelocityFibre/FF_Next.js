/**
 * Staff Filters
 * Custom hooks for staff filter management
 */

import React from 'react';
import { StaffFilter } from '@/types/staff.types';

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