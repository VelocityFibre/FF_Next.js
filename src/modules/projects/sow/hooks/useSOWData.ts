import { useState } from 'react';
import { SOW, SOWFilterType } from '../types/sow.types';

// Mock data - in real app this would come from API
const MOCK_SOWS: SOW[] = [
  {
    id: '1',
    sowNumber: 'SOW-2024-001',
    projectName: 'Downtown Fiber Expansion',
    clientName: 'City Municipality',
    status: 'active',
    version: '2.0',
    value: 250000,
    currency: 'USD',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    scope: [
      'Install 50km of fiber optic cable',
      'Connect 500 premises',
      'Setup 10 distribution points',
    ],
    deliverables: [
      'Network design documentation',
      'As-built drawings',
      'Test certificates',
      'Training materials',
    ],
    milestones: [
      {
        id: 'm1',
        name: 'Phase 1 - Design',
        description: 'Complete network design and approvals',
        dueDate: '2024-02-01',
        value: 50000,
        status: 'completed',
        deliverables: ['Network design', 'Permit approvals'],
      },
      {
        id: 'm2',
        name: 'Phase 2 - Installation',
        description: 'Install fiber infrastructure',
        dueDate: '2024-04-30',
        value: 150000,
        status: 'in_progress',
        deliverables: ['Installed cable', 'Connection reports'],
      },
      {
        id: 'm3',
        name: 'Phase 3 - Testing',
        description: 'Complete testing and handover',
        dueDate: '2024-06-30',
        value: 50000,
        status: 'pending',
        deliverables: ['Test results', 'Documentation'],
      },
    ],
    approvals: [
      {
        id: 'a1',
        approverName: 'John Manager',
        approverRole: 'Project Manager',
        status: 'approved',
        date: '2024-01-05',
      },
      {
        id: 'a2',
        approverName: 'Sarah Finance',
        approverRole: 'Finance Director',
        status: 'approved',
        date: '2024-01-06',
      },
    ],
    documents: [
      {
        id: 'd1',
        name: 'SOW_Contract_v2.pdf',
        type: 'contract',
        url: '#',
        uploadedDate: '2024-01-01',
        uploadedBy: 'Admin',
      },
      {
        id: 'd2',
        name: 'Technical_Specifications.xlsx',
        type: 'technical',
        url: '#',
        uploadedDate: '2024-01-02',
        uploadedBy: 'Tech Lead',
      },
    ],
    createdDate: '2023-12-15',
    lastModified: '2024-01-06',
    createdBy: 'Admin',
  },
  {
    id: '2',
    sowNumber: 'SOW-2024-002',
    projectName: 'Rural Connectivity Project',
    clientName: 'State Government',
    status: 'pending_approval',
    version: '1.0',
    value: 500000,
    currency: 'USD',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    scope: [
      'Connect 50 rural communities',
      'Install 100km backbone fiber',
      'Setup wireless last-mile connections',
    ],
    deliverables: [
      'Community coverage maps',
      'Installation reports',
      'Maintenance documentation',
    ],
    milestones: [],
    approvals: [
      {
        id: 'a3',
        approverName: 'Mark Director',
        approverRole: 'Operations Director',
        status: 'pending',
      },
    ],
    documents: [],
    createdDate: '2024-01-10',
    lastModified: '2024-01-15',
    createdBy: 'Sales Team',
  },
];

export function useSOWData() {
  const [sows] = useState<SOW[]>(MOCK_SOWS);
  const [filter, setFilter] = useState<SOWFilterType>('all');

  const filteredSOWs = filter === 'all' 
    ? sows 
    : sows.filter(sow => sow.status === filter);

  return {
    sows,
    filteredSOWs,
    filter,
    setFilter
  };
}