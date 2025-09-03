export interface SOWFile {
  type: 'poles' | 'drops' | 'fibre';
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  data?: any[];
  summary?: {
    total: number;
    valid: number;
    invalid: number;
    warnings?: string[];
  };
}

export interface SOWUploadSectionProps {
  projectId: string;
  projectName: string;
  onComplete?: () => void;
  onDataUpdate?: (data: { poles?: any[]; drops?: any[]; fibre?: any[] }) => void;
  showActions?: boolean;
}

export interface FileTypeConfig {
  type: 'poles' | 'drops' | 'fibre';
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  requiredColumns: string[];
  sampleData: any[];
}

export const FILE_TYPE_CONFIGS: FileTypeConfig[] = [
  {
    type: 'poles',
    title: 'Poles Data',
    description: 'Excel file with pole numbers, coordinates, and capacity',
    icon: null, // Will be set in component
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    requiredColumns: ['pole_number', 'latitude', 'longitude'],
    sampleData: [
      { pole_number: 'P001', latitude: -33.9249, longitude: 18.4241, max_drops: 12 },
      { pole_number: 'P002', latitude: -33.9251, longitude: 18.4243, max_drops: 12 }
    ]
  },
  {
    type: 'drops',
    title: 'Drops Data',
    description: 'Excel file with drop numbers, addresses, and pole assignments',
    icon: null,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    requiredColumns: ['drop_number', 'pole_number', 'address'],
    sampleData: [
      { drop_number: 'D001', pole_number: 'P001', address: '123 Main St', status: 'planned' },
      { drop_number: 'D002', pole_number: 'P001', address: '125 Main St', status: 'planned' }
    ]
  },
  {
    type: 'fibre',
    title: 'Fibre Scope',
    description: 'Excel file with cable segments, distances, and types',
    icon: null,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    requiredColumns: ['segment_id', 'from_point', 'to_point', 'distance'],
    sampleData: [
      { segment_id: 'S001', from_point: 'P001', to_point: 'P002', distance: 150, cable_type: 'aerial' },
      { segment_id: 'S002', from_point: 'P002', to_point: 'P003', distance: 200, cable_type: 'underground' }
    ]
  }
];