import { useState } from 'react';
import type { NeonPole } from '../../services/poleTrackerNeonService';
import type { PoleFilters, ViewMode } from '../types/poleTracker.types';

export function usePoleTrackerList(poles: NeonPole[]) {
  const [filters, setFilters] = useState<PoleFilters>({
    searchTerm: '',
    selectedStatus: 'all',
    selectedPhase: 'all'
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filter poles based on search and filters - using Neon field names
  const filteredPoles = poles.filter((pole: NeonPole) => {
    const matchesSearch = !filters.searchTerm || 
      pole.pole_number?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      pole.location?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      pole.project_code?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStatus = filters.selectedStatus === 'all' || pole.status === filters.selectedStatus;
    const matchesPhase = filters.selectedPhase === 'all' || pole.phase === filters.selectedPhase;
    
    return matchesSearch && matchesStatus && matchesPhase;
  });

  const updateFilters = (newFilters: Partial<PoleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    filters,
    viewMode,
    filteredPoles,
    updateFilters,
    setViewMode
  };
}