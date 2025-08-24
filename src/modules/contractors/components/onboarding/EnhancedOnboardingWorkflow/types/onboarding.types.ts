import { DocumentType } from '@/types/contractor.types';

export interface OnboardingStage {
  id: string;
  title: string;
  description: string;
  icon: string;
  documents: {
    type: DocumentType;
    title: string;
    description?: string;
    required: boolean;
  }[];
  isComplete?: boolean;
  completionPercentage?: number;
}

export interface EnhancedOnboardingWorkflowProps {
  contractorId: string;
  contractorName: string;
  onStatusChange?: (status: string) => void;
}

export type StageStatus = 'complete' | 'in_progress' | 'rejected' | 'pending';