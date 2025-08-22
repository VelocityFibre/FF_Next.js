import type { FieldTask, FieldTechnician, OfflineData, DeviceStatus } from '../types/field-app.types';

export const mockTasks: FieldTask[] = [
  {
    id: 'FT001',
    type: 'installation',
    title: 'New Fiber Installation',
    customer: 'John Doe',
    address: '123 Main St, Stellenbosch',
    coordinates: { lat: -33.9249, lng: 18.8241 },
    priority: 'high',
    status: 'pending',
    scheduledTime: '09:00',
    estimatedDuration: '2h',
    syncStatus: 'synced',
    offline: false,
    attachments: 2,
    notes: 'Customer prefers morning installation'
  },
  {
    id: 'FT002',
    type: 'maintenance',
    title: 'ONT Replacement',
    customer: 'Jane Smith',
    address: '456 Oak Avenue, Paarl',
    coordinates: { lat: -33.7369, lng: 18.9581 },
    priority: 'medium',
    status: 'in_progress',
    scheduledTime: '11:30',
    estimatedDuration: '1h',
    syncStatus: 'pending',
    offline: true,
    attachments: 1,
    notes: 'Faulty ONT reported'
  },
  {
    id: 'FT003',
    type: 'inspection',
    title: 'Network Quality Check',
    customer: 'ABC Business',
    address: '789 Industrial Rd, Somerset West',
    coordinates: { lat: -34.0732, lng: 18.8473 },
    priority: 'low',
    status: 'completed',
    scheduledTime: '14:00',
    estimatedDuration: '45min',
    syncStatus: 'synced',
    offline: false,
    attachments: 3,
    notes: 'Quarterly inspection'
  }
];

export const mockTechnicians: FieldTechnician[] = [
  {
    id: 'TECH001',
    name: 'Mike Johnson',
    status: 'active',
    location: { lat: -33.9249, lng: 18.8241 },
    currentTask: 'FT001',
    expertise: ['Fiber Installation', 'ONT Setup', 'Troubleshooting'],
    rating: 4.8,
    completedToday: 3
  },
  {
    id: 'TECH002',
    name: 'Sarah Wilson',
    status: 'busy',
    location: { lat: -33.7369, lng: 18.9581 },
    currentTask: 'FT002',
    expertise: ['Network Testing', 'Equipment Repair', 'Customer Support'],
    rating: 4.6,
    completedToday: 2
  },
  {
    id: 'TECH003',
    name: 'David Brown',
    status: 'offline',
    location: { lat: -34.0732, lng: 18.8473 },
    expertise: ['Quality Assurance', 'Documentation', 'Training'],
    rating: 4.9,
    completedToday: 4
  }
];

export const mockOfflineData: OfflineData = {
  tasks: 5,
  photos: 12,
  forms: 3,
  lastSync: '2 hours ago',
  dataSize: '2.4 MB'
};

export const mockDeviceStatus: DeviceStatus = {
  battery: 78,
  signal: 'good',
  gpsAccuracy: 3.2,
  storage: { used: 45.2, total: 128 }
};