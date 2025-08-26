/**
 * Applications Components - Barrel export for all application-related components
 */

export { ApplicationFilters } from './ApplicationFilters';
export { ApplicationTable } from './ApplicationTable';
export { ApplicationActions, BulkApplicationActions } from './ApplicationActions';
export { OnboardingProgressCard } from './OnboardingProgressCard';
export { PendingApplicationsList } from './PendingApplicationsList';

// Re-export types for convenience
export type {
  ApplicationFilters as IApplicationFilters,
  ApplicationSummary,
  ApplicationStatus,
  ApplicationProgress,
  ApprovalAction,
  ApprovalActionResult,
  BulkApprovalRequest,
  OnboardingStage,
  DocumentCompletionStatus,
  ContractorApplication,
  ApplicationReview,
  ApplicationNotification,
  ApplicationAnalytics
} from '@/types/contractor.types';