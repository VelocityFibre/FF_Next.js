export interface HomeInstallation {
  id: string;
  customerDetails: CustomerDetails;
  address: InstallationAddress;
  installationType: InstallationType;
  status: InstallationStatus;
  scheduling: SchedulingInfo;
  technical: TechnicalDetails;
  equipment: EquipmentUsed[];
  testing: TestingResults;
  documents: InstallationDocument[];
  billing: BillingInfo;
  qualityChecks: QualityCheck[];
  timeline: InstallationTimeline;
  notes: InstallationNote[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  idNumber: string;
  accountNumber: string;
  preferredContactMethod: 'phone' | 'email' | 'sms';
  specialRequirements?: string;
}

export interface InstallationAddress {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  propertyType: 'house' | 'apartment' | 'complex' | 'business';
  accessNotes?: string;
  gateCode?: string;
}

export type InstallationType = 
  | 'new_installation'
  | 'upgrade'
  | 'relocation'
  | 'repair'
  | 'temporary';

export type InstallationStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'postponed'
  | 'cancelled'
  | 'pending_customer'
  | 'quality_check';

export interface SchedulingInfo {
  scheduledDate: Date;
  scheduledTimeSlot: string;
  estimatedDuration: number; // in hours
  assignedTeam: string;
  assignedTechnicians: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  rescheduledCount: number;
  rescheduledHistory: RescheduleRecord[];
}

export interface RescheduleRecord {
  originalDate: Date;
  newDate: Date;
  reason: string;
  requestedBy: 'customer' | 'technician' | 'system';
  timestamp: Date;
}

export interface TechnicalDetails {
  connectionType: 'FTTH' | 'FTTB' | 'FTTC' | 'Wireless';
  packageSpeed: string; // e.g., "100/100 Mbps"
  ontSerialNumber?: string;
  ontModel?: string;
  routerSerialNumber?: string;
  routerModel?: string;
  dropCableLength: number; // in meters
  fiberCableType: string;
  splitterLocation?: string;
  splitterPort?: number;
  oltPort?: string;
  signalStrength?: number; // in dBm
}

export interface EquipmentUsed {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  serialNumbers?: string[];
  category: 'cable' | 'connector' | 'device' | 'tool' | 'consumable';
  returned: boolean;
}

export interface TestingResults {
  speedTest: {
    download: number; // Mbps
    upload: number; // Mbps
    latency: number; // ms
    jitter: number; // ms
    packetLoss: number; // percentage
    timestamp: Date;
  };
  signalTest: {
    opticalPower: number; // dBm
    attentuation: number; // dB
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    timestamp: Date;
  };
  connectivityTests: {
    internetAccess: boolean;
    dnsResolution: boolean;
    gatewayReachable: boolean;
    dhcpWorking: boolean;
    voipService?: boolean;
    iptvService?: boolean;
  };
  customerSignoff: {
    signed: boolean;
    signedBy?: string;
    signedAt?: Date;
    signature?: string; // base64 encoded
    satisfactionRating?: number; // 1-5
  };
}

export interface InstallationDocument {
  id: string;
  type: DocumentType;
  name: string;
  url?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export type DocumentType = 
  | 'installation_form'
  | 'customer_agreement'
  | 'site_photos'
  | 'speed_test_result'
  | 'quality_checklist'
  | 'customer_signoff'
  | 'equipment_receipt';

export interface BillingInfo {
  installationFee: number;
  equipmentDeposit: number;
  monthlySubscription: number;
  additionalCharges?: {
    description: string;
    amount: number;
  }[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'eft' | 'debit_order';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  invoiceNumber?: string;
  invoiceDate?: Date;
}

export interface QualityCheck {
  id: string;
  checkType: 'pre_installation' | 'post_installation' | 'follow_up';
  performedBy: string;
  performedAt: Date;
  checklistItems: ChecklistItem[];
  overallResult: 'pass' | 'fail' | 'conditional';
  issues: string[];
  recommendations: string[];
  photosUrls?: string[];
}

export interface ChecklistItem {
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface InstallationTimeline {
  requestedAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  activatedAt?: Date;
  qualityCheckedAt?: Date;
}

export interface InstallationNote {
  id: string;
  author: string;
  timestamp: Date;
  type: 'general' | 'technical' | 'customer' | 'billing';
  content: string;
  isInternal: boolean;
}

export interface InstallationMetrics {
  totalInstallations: number;
  completedToday: number;
  scheduledToday: number;
  failedToday: number;
  averageCompletionTime: number; // in hours
  firstTimeSuccessRate: number; // percentage
  customerSatisfactionScore: number; // 1-5
  technicianUtilization: number; // percentage
}

export interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  installationsCompleted: number;
  averageTime: number; // in hours
  successRate: number; // percentage
  customerRating: number; // 1-5
  specializations: string[];
  currentStatus: 'available' | 'on_job' | 'break' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
}