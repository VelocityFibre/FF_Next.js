import { useState, useEffect } from 'react';
import { Installation, FilterStatus } from '../types/installation.types';
import { calculateInstallationStats } from '../utils/installationUtils';
import { log } from '@/lib/logger';

export function useHomeInstallations() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    loadInstallations();
  }, []);

  const loadInstallations = async () => {
    // 🟢 WORKING: Empty state - no mock data. Connect to real installations service when available.
    // TODO: Replace with actual service calls when installations system is implemented
    
    try {
      // Empty array - shows "No installations found" etc. in UI
      const installations: Installation[] = [];
      
      // Future implementation would be:
      // const installations = await installationsService.getHomeInstallations();
      // const installations = await ProjectQueryService.getInstallations();
      
      setInstallations(installations);
    } catch (error) {
      log.error('Error loading installations:', { data: error }, 'useHomeInstallations');
      setInstallations([]); // Ensure empty state on error
    }
  };

  const handleTabChange = (tabIndex: number, status: FilterStatus) => {
    setSelectedTab(tabIndex);
    setFilterStatus(status);
  };

  const filteredInstallations = installations.filter(inst => {
    if (filterStatus === 'all') return true;
    return inst.status === filterStatus;
  });

  const stats = calculateInstallationStats(installations);

  return {
    installations,
    selectedTab,
    filterStatus,
    filteredInstallations,
    stats,
    handleTabChange
  };
}