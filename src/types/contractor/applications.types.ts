/**
 * Application Types - Types for contractor application management and pending applications system
 */

import { RAGScore } from './base.types';

// Application-specific statuses for pending applications management
export type ApplicationStatus = 'pending' | 'under_review' | 'documentation_incomplete' | 'approved' | 'rejected';

// Onboarding stages for progress tracking
export type OnboardingStage = {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  required: boolean;
  order: number;
  completedAt?: Date;
  dueDate?: Date;
};

// Application progress tracking
export interface ApplicationProgress {
  contractorId: string;
  overallProgress: number; // 0-100
  stagesCompleted: number;
  totalStages: number;
  currentStage?: string;
  stages: OnboardingStage[];
  documentsUploaded: number;
  documentsRequired: number;
  lastActivity?: Date;
  estimatedCompletion?: Date;
}

// Application filters for filtering and searching
export interface ApplicationFilters {
  status?: ApplicationStatus[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  documentStatus?: 'complete' | 'incomplete' | 'expired';
  progressRange?: {
    min: number;
    max: number;
  };
  ragScore?: RAGScore[];
  companyName?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'progress' | 'companyName';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Approval action types
export type ApprovalAction = 'approve' | 'reject' | 'request_more_info' | 'escalate';

// Action result for bulk operations
export interface ApprovalActionResult {
  contractorId: string;
  action: ApprovalAction;
  success: boolean;
  message?: string;
  timestamp: Date;
}

// Bulk operation request
export interface BulkApprovalRequest {
  contractorIds: string[];
  action: ApprovalAction;
  reason?: string;
  notes?: string;
  notifyContractors?: boolean;
}

// Application summary for table display
export interface ApplicationSummary {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  status: ApplicationStatus;
  applicationDate: Date;
  lastActivity?: Date;
  progress: number;
  documentsComplete: boolean;
  ragOverall: RAGScore;
  urgentFlags: string[];
  daysInReview: number;
  estimatedCompletion?: Date;
  nextAction?: string;
}

// Document completion status for applications
export interface DocumentCompletionStatus {
  documentType: string;
  required: boolean;
  uploaded: boolean;
  approved?: boolean;
  expiryDate?: Date;
  isExpired: boolean;
  isExpiringSoon: boolean; // Within 30 days
}

// Enhanced contractor with application-specific data
export interface ContractorApplication {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  registrationNumber: string;
  businessType: 'pty_ltd' | 'cc' | 'sole_proprietor' | 'partnership';
  
  // Application status
  status: ApplicationStatus;
  applicationDate: Date;
  lastActivity?: Date;
  
  // Progress tracking
  progress: ApplicationProgress;
  
  // Document status
  documents: DocumentCompletionStatus[];
  
  // RAG scoring
  ragOverall: RAGScore;
  ragFinancial: RAGScore;
  ragCompliance: RAGScore;
  
  // Flags and notes
  urgentFlags: string[];
  reviewNotes?: string[];
  assignedReviewer?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Application review data for detailed views
export interface ApplicationReview {
  contractorId: string;
  reviewerId: string;
  reviewerName: string;
  status: ApplicationStatus;
  decision?: ApprovalAction;
  comments: string;
  checklist: {
    item: string;
    completed: boolean;
    notes?: string;
  }[];
  attachments?: string[];
  reviewDate: Date;
  followUpRequired: boolean;
  followUpDate?: Date;
}

// Application notification types
export interface ApplicationNotification {
  id: string;
  contractorId: string;
  type: 'status_change' | 'document_required' | 'deadline_approaching' | 'review_complete';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sent: boolean;
  sentAt?: Date;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

// Application analytics for dashboard
export interface ApplicationAnalytics {
  totalApplications: number;
  pendingApplications: number;
  underReviewApplications: number;
  documentIncompleteApplications: number;
  averageProcessingTime: number; // days
  approvalRate: number; // percentage
  rejectionRate: number; // percentage
  applicationsByMonth: {
    month: string;
    count: number;
  }[];
  processingTimeByStage: {
    stage: string;
    averageDays: number;
  }[];
  bottlenecks: {
    stage: string;
    count: number;
    averageDelayDays: number;
  }[];
}