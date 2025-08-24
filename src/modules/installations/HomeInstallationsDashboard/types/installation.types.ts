export interface Installation {
  id: string;
  homeNumber: string;
  clientName: string;
  address: string;
  installDate: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'issue' | 'cancelled';
  technician: string;
  equipment: {
    ont: boolean;
    router: boolean;
    cables: boolean;
    splitter: boolean;
  };
  speedTest: {
    download: number;
    upload: number;
    ping: number;
  };
  issues: string[];
  completionTime?: string;
  customerSatisfaction?: number;
}

export interface InstallationStats {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  issues: number;
  avgSpeed: number;
}

export type FilterStatus = 'all' | 'scheduled' | 'in_progress' | 'completed' | 'issue';