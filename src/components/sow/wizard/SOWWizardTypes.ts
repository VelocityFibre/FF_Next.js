/**
 * SOW Upload Wizard Types and Interfaces
 */

export interface SOWUploadStep {
  id: 'poles' | 'drops' | 'fibre';
  title: string;
  description: string;
  completed: boolean;
  file?: File;
  data?: any[];
}

export interface SOWUploadWizardProps {
  projectId: string;
  projectName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  processedData?: any[];
}

export const INITIAL_STEPS: SOWUploadStep[] = [
  {
    id: 'poles',
    title: 'Upload Poles Data',
    description: 'Upload Excel file containing pole information (coordinates, pole numbers, etc.)',
    completed: false
  },
  {
    id: 'drops',
    title: 'Upload Drops Data',
    description: 'Upload Excel file containing drop information (drop numbers, addresses, pole assignments)',
    completed: false
  },
  {
    id: 'fibre',
    title: 'Upload Fibre Data',
    description: 'Upload Excel file containing fibre information (cable lengths, trenching/stringing distances)',
    completed: false
  }
];