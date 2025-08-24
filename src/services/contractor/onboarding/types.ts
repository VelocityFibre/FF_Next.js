/**
 * Onboarding Types and Interfaces
 * Type definitions for contractor onboarding workflow
 */

import { DocumentType } from '@/types/contractor.types';

// Onboarding stage interface
export interface OnboardingStage {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  documents: DocumentType[];
  checklist: OnboardingChecklistItem[];
}

// Checklist item interface
export interface OnboardingChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: 'legal' | 'financial' | 'technical' | 'safety' | 'insurance';
}

// Overall onboarding progress interface
export interface OnboardingProgress {
  contractorId: string;
  currentStage: number;
  totalStages: number;
  completionPercentage: number;
  stages: OnboardingStage[];
  overallStatus: OnboardingStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  lastUpdated: Date;
}

// Onboarding status type
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected';

// Stage update request interface
export interface StageUpdateRequest {
  contractorId: string;
  stageId: string;
  checklistItemId: string;
  completed: boolean;
}

// Approval request interface
export interface ApprovalRequest {
  contractorId: string;
  approvedBy: string;
  notes?: string;
}

// Rejection request interface
export interface RejectionRequest {
  contractorId: string;
  rejectedBy: string;
  rejectionReason: string;
  notes?: string;
}

// Document requirement interface
export interface DocumentRequirement {
  documentType: DocumentType;
  required: boolean;
  description: string;
  stageId: string;
}

// Onboarding statistics interface
export interface OnboardingStatistics {
  totalContractors: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  approved: number;
  rejected: number;
  averageCompletionTime: number; // in days
  mostCommonStuckStage: string;
}

// Stage completion summary
export interface StageCompletionSummary {
  stageId: string;
  stageName: string;
  requiredItems: number;
  completedItems: number;
  completionPercentage: number;
  isCompleted: boolean;
  blockers: string[];
}

// Onboarding workflow configuration
export interface OnboardingWorkflowConfig {
  stages: OnboardingStage[];
  requiredDocuments: DocumentType[];
  autoApprovalThreshold?: number;
  reminderIntervals: number[]; // in days
  maxOnboardingDuration: number; // in days
}