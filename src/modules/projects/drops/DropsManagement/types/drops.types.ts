export interface Drop {
  id: string;
  dropNumber: string;
  poleNumber: string;
  customerName: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'failed';
  installationType: 'aerial' | 'underground' | 'hybrid';
  cableLength: number; // meters
  scheduledDate?: string;
  completedDate?: string;
  technician?: string;
  notes?: string;
  issues?: string[];
  photos?: string[];
}

export interface DropsStats {
  totalDrops: number;
  completedDrops: number;
  pendingDrops: number;
  inProgressDrops: number;
  failedDrops: number;
  completionRate: number;
  averageInstallTime: number; // hours
  totalCableUsed: number; // meters
}

export interface DropsFiltersState {
  searchTerm: string;
  statusFilter: string;
}