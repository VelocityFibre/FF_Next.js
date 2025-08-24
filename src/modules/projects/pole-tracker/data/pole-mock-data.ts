/**
 * Pole Mock Data
 * Mock data for pole tracker detail component demonstration
 */

import { InstallationPhase, PoleType } from '../types/pole-tracker.types';
import { PoleDetail } from '../types/pole-detail.types';

export const mockPoleDetail: PoleDetail = {
  id: '1',
  vfPoleId: 'LAW.P.A001',
  poleNumber: 'P001',
  projectName: 'Lawley Extension',
  projectCode: 'LAW001',
  contractorName: 'ABC Contractors',
  status: 'Pole Permission: Approved',
  installationPhase: InstallationPhase.INSTALLATION,
  location: 'Lawley Ext 3, Johannesburg',
  dropCount: 8,
  maxCapacity: 12,
  dateInstalled: new Date('2025-08-15'),
  hasPhotos: true,
  qualityStatus: 'pass',
  poleType: PoleType.CONCRETE,
  poleHeight: 12,
  installationDepth: 2.5,
  gpsCoordinates: {
    latitude: -26.2041,
    longitude: 28.0473,
    accuracy: 3
  },
  workingTeam: 'Team Alpha',
  ratePaid: 2500,
  estimatedCompletionDate: new Date('2025-08-20'),
  actualCompletionDate: new Date('2025-08-18'),
  createdAt: new Date('2025-08-10'),
  updatedAt: new Date('2025-08-18'),
  createdByName: 'John Smith',
  updatedByName: 'Jane Doe',
  photos: [
    { id: '1', type: 'before', url: '/placeholder.jpg', description: 'Site before installation' },
    { id: '2', type: 'front', url: '/placeholder.jpg', description: 'Front view of pole' },
    { id: '3', type: 'depth', url: '/placeholder.jpg', description: 'Installation depth measurement' },
    { id: '4', type: 'concrete', url: '/placeholder.jpg', description: 'Base foundation' },
    { id: '5', type: 'completed', url: '/placeholder.jpg', description: 'Final installation' },
    { id: '6', type: 'compaction', url: '/placeholder.jpg', description: 'Ground compaction' },
  ],
  qualityChecks: [
    { id: '1', checkType: 'depth_compliance', status: 'pass', checkedBy: 'John Smith', checkedAt: new Date('2025-08-18') },
    { id: '2', checkType: 'concrete_quality', status: 'pass', checkedBy: 'John Smith', checkedAt: new Date('2025-08-18') },
    { id: '3', checkType: 'alignment', status: 'pass', checkedBy: 'John Smith', checkedAt: new Date('2025-08-18') },
    { id: '4', checkType: 'grounding', status: 'pending', checkedBy: '', checkedAt: null },
  ]
};