import { useState, useEffect } from 'react';
import { Installation, FilterStatus } from '../types/installation.types';
import { calculateInstallationStats } from '../utils/installationUtils';

export function useHomeInstallations() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    loadInstallations();
  }, []);

  const loadInstallations = () => {
    // Mock data for now
    const mockData: Installation[] = [
      {
        id: 'INST001',
        homeNumber: 'H001',
        clientName: 'John Smith',
        address: '123 Main Street, Sandton',
        installDate: new Date('2024-01-20'),
        status: 'completed',
        technician: 'Mike Johnson',
        equipment: {
          ont: true,
          router: true,
          cables: true,
          splitter: true
        },
        speedTest: {
          download: 950,
          upload: 890,
          ping: 5
        },
        issues: [],
        completionTime: '2h 30m',
        customerSatisfaction: 5
      },
      {
        id: 'INST002',
        homeNumber: 'H002',
        clientName: 'Jane Doe',
        address: '456 Park Road, Rosebank',
        installDate: new Date('2024-01-21'),
        status: 'in_progress',
        technician: 'Sarah Williams',
        equipment: {
          ont: true,
          router: true,
          cables: false,
          splitter: false
        },
        speedTest: {
          download: 0,
          upload: 0,
          ping: 0
        },
        issues: ['Waiting for cable delivery']
      },
      {
        id: 'INST003',
        homeNumber: 'H003',
        clientName: 'Bob Wilson',
        address: '789 Oak Avenue, Fourways',
        installDate: new Date('2024-01-22'),
        status: 'scheduled',
        technician: 'Tom Davis',
        equipment: {
          ont: false,
          router: false,
          cables: false,
          splitter: false
        },
        speedTest: {
          download: 0,
          upload: 0,
          ping: 0
        },
        issues: []
      }
    ];
    setInstallations(mockData);
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