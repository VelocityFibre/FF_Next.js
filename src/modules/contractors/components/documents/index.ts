/**
 * Documents Module - Barrel export for document approval workflow components
 * @module DocumentsIndex
 */

// Main components
export { DocumentApprovalQueue } from './DocumentApprovalQueue';
export { DocumentViewer } from './DocumentViewer';
export { ApprovalActions } from './ApprovalActions';
export { DocumentFilters } from './DocumentFilters';
export { ComplianceTracker } from './ComplianceTracker';
export { BatchApprovalModal } from './BatchApprovalModal';

// Existing components (maintain compatibility)
export { DocumentManagement } from './DocumentManagement';

// Types
export type {
  DocumentApprovalQueue as DocumentApprovalQueueType,
  DocumentApprovalAction,
  BulkApprovalRequest,
  ComplianceStatus,
  DocumentApprovalFilter,
  DocumentSortOptions,
  DocumentRejectionReason,
  ComplianceIssue,
  ComplianceFlag,
  DocumentQueueStats,
  DocumentPreviewData,
  ApprovalWorkflowConfig,
  AutoApprovalRule,
  ApprovalCondition,
  ApprovalAction,
  EscalationRule,
  NotificationSettings,
  NotificationTemplate
} from './types/documentApproval.types';