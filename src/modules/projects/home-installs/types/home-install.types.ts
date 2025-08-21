export interface HomeInstall {
  id: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  address: string;
  alternatePhone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  installationType: 'new' | 'upgrade' | 'repair' | 'relocation';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date | string;
  completedDate?: Date | string;
  estimatedDuration?: number;
  technicianId?: string;
  technicianName?: string;
  assignedTechnician?: string;
  notes?: string;
  specialRequirements?: string;
  issues?: string[];
  equipment?: string[];
  ontSerial?: string;
  routerSerial?: string;
  cableLength?: number;
  speedPackage?: string;
  packageType?: string;
  speed?: string;
  monthlyFee?: number;
  installationFee?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface HomeInstallFormData {
  customerId: string;
  customerName: string;
  address: string;
  installationType: 'new' | 'upgrade' | 'repair' | 'relocation';
  scheduledDate: Date | string;
  technicianId?: string;
  notes?: string;
  speedPackage?: string;
  monthlyFee?: number;
  installationFee?: number;
}

export interface HomeInstallFilter {
  status?: string[];
  installationType?: string[];
  technicianId?: string;
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
}

export interface HomeInstallStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  revenue: {
    monthly: number;
    installation: number;
    total: number;
  };
}