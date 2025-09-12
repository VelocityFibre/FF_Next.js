import { useState, useEffect } from 'react';
import type { Drop, DropsStats, DropsFiltersState } from '../types/drops.types';

export function useDropsManagement() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [filters, setFilters] = useState<DropsFiltersState>({
    searchTerm: '',
    statusFilter: 'all',
  });

  useEffect(() => {
    fetchDropsData();
  }, []);

  const fetchDropsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sow/drops');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch drops');
      }
      
      if (result.success && result.data) {
        // Transform database records to Drop format
        const transformedDrops: Drop[] = result.data.map((dbDrop: any) => ({
          id: dbDrop.id,
          dropNumber: dbDrop.drop_number,
          poleNumber: dbDrop.pole_number || '',
          customerName: dbDrop.end_point || 'Unknown Customer',
          address: dbDrop.address || dbDrop.end_point || '',
          status: determineStatus(dbDrop),
          installationType: dbDrop.cable_type || 'aerial',
          cableLength: parseFloat(dbDrop.cable_length) || 0,
          scheduledDate: dbDrop.created_date,
          completedDate: dbDrop.updated_at,
          technician: dbDrop.created_by || 'Unassigned',
          latitude: dbDrop.latitude,
          longitude: dbDrop.longitude,
          municipality: dbDrop.municipality,
          zone: dbDrop.zone_no,
          pon: dbDrop.pon_no,
        }));
        
        setDrops(transformedDrops);
        calculateStats(transformedDrops);
      } else {
        // Fallback to mock data if no database records
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
      }
    } catch (err) {
      console.error('Error fetching drops:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drops');
      // Use mock data as fallback
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
      ];
      setDrops(mockDrops);
      calculateStats(mockDrops);
    } finally {
      setLoading(false);
    }
  };

  const determineStatus = (dbDrop: any): Drop['status'] => {
    // Simple logic to determine status based on available data
    if (dbDrop.completed_date) return 'completed';
    if (dbDrop.technician && dbDrop.scheduled_date) return 'in_progress';
    if (dbDrop.scheduled_date) return 'scheduled';
    return 'pending';
  };

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

  const updateFilters = (newFilters: Partial<DropsFiltersState>) => {
    setFilters((prev: DropsFiltersState) => ({ ...prev, ...newFilters }));
  };

  return {
    drops,
    stats,
    filters,
    filteredDrops,
    updateFilters,
    loading,
    error,
    refetch: fetchDropsData
  };
}