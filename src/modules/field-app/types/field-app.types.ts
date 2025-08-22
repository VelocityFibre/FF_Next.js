export interface FieldTask {
  id: string;
  type: 'installation' | 'maintenance' | 'inspection' | 'repair';
  title: string;
  customer: string;
  address: string;
  coordinates: { lat: number; lng: number };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  scheduledTime: string;
  estimatedDuration: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  offline: boolean;
  attachments: number;
  notes: string;
}

export interface OfflineData {
  tasks: number;
  photos: number;
  forms: number;
  lastSync: string;
  dataSize: string;
}

export interface FieldTechnician {
  id: string;
  name: string;
  status: 'active' | 'offline' | 'busy';
  location: { lat: number; lng: number };
  currentTask?: string;
  expertise: string[];
  rating: number;
  completedToday: number;
}

export interface DeviceStatus {
  battery: number;
  signal: 'excellent' | 'good' | 'fair' | 'poor';
  gpsAccuracy: number;
  storage: { used: number; total: number };
}