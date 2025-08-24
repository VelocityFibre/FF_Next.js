import { useState, useEffect } from 'react';
import type { Drop, DropsStats, DropsFilters } from '../types/drops.types';

export function useDropsManagement() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [stats, setStats] = useState<DropsStats>({
    totalDrops: 0,
    completedDrops: 0,
    pendingDrops: 0,
    inProgressDrops: 0,
    failedDrops: 0,
    completionRate: 0,
    averageInstallTime: 0,
    totalCableUsed: 0,
  });
  const [filters, setFilters] = useState<DropsFilters>({
    searchTerm: '',
    statusFilter: 'all',
  });

  useEffect(() => {
    // Load drops data - TODO: Replace with actual API call
    const mockDrops: Drop[] = [
      {
        id: '1',
        dropNumber: 'D001',
        poleNumber: 'P001',
        customerName: 'John Smith',
        address: '123 Main St',
        status: 'completed',
        installationType: 'aerial',
        cableLength: 45,
        scheduledDate: '2024-01-15',
        completedDate: '2024-01-15',
        technician: 'Mike Johnson',
      },
      {
        id: '2',
        dropNumber: 'D002',
        poleNumber: 'P001',
        customerName: 'Jane Doe',
        address: '125 Main St',
        status: 'in_progress',
        installationType: 'aerial',
        cableLength: 52,
        scheduledDate: '2024-01-20',
        technician: 'Tom Wilson',
      },
      {
        id: '3',
        dropNumber: 'D003',
        poleNumber: 'P002',
        customerName: 'Bob Wilson',
        address: '456 Oak Ave',
        status: 'scheduled',
        installationType: 'underground',
        cableLength: 78,
        scheduledDate: '2024-01-22',
        technician: 'Sarah Lee',
      },
      {
        id: '4',
        dropNumber: 'D004',
        poleNumber: 'P002',
        customerName: 'Alice Brown',
        address: '458 Oak Ave',
        status: 'pending',
        installationType: 'aerial',
        cableLength: 60,
      },
      {
        id: '5',
        dropNumber: 'D005',
        poleNumber: 'P003',
        customerName: 'Charlie Davis',
        address: '789 Pine Rd',
        status: 'failed',
        installationType: 'hybrid',
        cableLength: 95,
        scheduledDate: '2024-01-18',
        technician: 'Mike Johnson',
        issues: ['Customer not available', 'Rescheduling required'],
      },
    ];

    setDrops(mockDrops);
    calculateStats(mockDrops);
  }, []);

  const calculateStats = (dropsData: Drop[]) => {
    const total = dropsData.length;
    const completed = dropsData.filter(d => d.status === 'completed').length;
    const pending = dropsData.filter(d => d.status === 'pending').length;
    const inProgress = dropsData.filter(d => d.status === 'in_progress').length;
    const failed = dropsData.filter(d => d.status === 'failed').length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const totalCable = dropsData.reduce((sum, d) => sum + d.cableLength, 0);
    
    // Calculate average install time from completed drops
    const completedWithTime = dropsData.filter(
      d => d.status === 'completed' && d.scheduledDate && d.completedDate
    );
    
    let avgTime = 0;
    if (completedWithTime.length > 0) {
      // Simplified: assuming same-day installation for now
      avgTime = 4; // Average 4 hours per installation
    }

    setStats({
      totalDrops: total,
      completedDrops: completed,
      pendingDrops: pending,
      inProgressDrops: inProgress,
      failedDrops: failed,
      completionRate,
      averageInstallTime: avgTime,
      totalCableUsed: totalCable,
    });
  };

  const filteredDrops = drops.filter(drop => {
    const matchesSearch = filters.searchTerm === '' || 
      drop.customerName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      drop.address.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      drop.dropNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      drop.poleNumber.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStatus = filters.statusFilter === 'all' || drop.status === filters.statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateFilters = (newFilters: Partial<DropsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    drops,
    stats,
    filters,
    filteredDrops,
    updateFilters
  };
}