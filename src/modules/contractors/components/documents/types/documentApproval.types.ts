/**
 * Document Approval Types - Interface definitions for document approval workflow
 * @module DocumentApprovalTypes
 */

import { ContractorDocument } from '@/types/contractor.types';

/**
 * Document approval queue configuration
 */
export interface DocumentApprovalQueue {
  id: string;
  name: string;
  description: string;
  filters: DocumentApprovalFilter[];
  sortBy: DocumentSortOptions;
  batchProcessing: boolean;
  autoRefreshInterval: number; // seconds
}

/**
 * Document approval action with metadata
 */
export interface DocumentApprovalAction {
  documentId: string;
  action: 'approve' | 'reject' | 'request_changes';
  notes?: string;
  reasonCode?: DocumentRejectionReason;
  processedBy: string;
  processedAt: Date;
  requiresFollowUp: boolean;
  followUpDate?: Date;
  complianceFlags: ComplianceFlag[];
}

/**
 * Bulk approval request for multiple documents
 */
export interface BulkApprovalRequest {
  documentIds: string[];
  action: 'approve' | 'reject';
  reasonCode?: DocumentRejectionReason;
  notes?: string;
  processedBy: string;
  skipValidation?: boolean;
}

/**
 * Document compliance status tracking
 */
export interface ComplianceStatus {
  documentId: string;
  contractorId: string;
  documentType: string;
  isCompliant: boolean;
  complianceScore: number; // 0-100
  issues: ComplianceIssue[];
  lastChecked: Date;
  nextReview: Date;
  autoReviewEnabled: boolean;
}

/**
 * Document approval filter criteria
 */
export interface DocumentApprovalFilter {
  field: keyof ContractorDocument | 'contractorName';
  operator: FilterOperator;
  value: string | number | Date | boolean;
  label: string;
}

/**
 * Document sorting options
 */
export interface DocumentSortOptions {
  field: keyof ContractorDocument | 'contractorName' | 'priority';
  direction: 'asc' | 'desc';
  secondarySort?: {
    field: keyof ContractorDocument;
    direction: 'asc' | 'desc';
  };
}

/**
 * Document rejection reasons with codes
 */
export type DocumentRejectionReason =
  | 'expired'
  | 'invalid_format'
  | 'poor_quality'
  | 'incomplete_information'
  | 'incorrect_document_type'
  | 'missing_signature'
  | 'invalid_issuer'
  | 'duplicate'
  | 'other';

/**
 * Compliance issue types
 */
export interface ComplianceIssue {
  id: string;
  type: ComplianceIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestedAction: string;
  autoFixAvailable: boolean;
}

/**
 * Compliance issue types
 */
export type ComplianceIssueType =
  | 'expiry_warning'
  | 'missing_document'
  | 'invalid_format'
  | 'quality_check_failed'
  | 'regulatory_compliance'
  | 'security_concern';

/**
 * Compliance flags for tracking
 */
export interface ComplianceFlag {
  type: ComplianceFlagType;
  priority: 'low' | 'medium' | 'high';
  description: string;
  resolvedAt?: Date;
}

/**
 * Compliance flag types
 */
export type ComplianceFlagType =
  | 'requires_manual_review'
  | 'regulatory_check_needed'
  | 'quality_assurance_required'
  | 'legal_review_pending'
  | 'technical_validation_needed';

/**
 * Filter operators for document queries
 */
export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null';

/**
 * Document queue statistics
 */
export interface DocumentQueueStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  expiringWithin30Days: number;
  averageProcessingTime: number; // minutes
  queuedToday: number;
  processedToday: number;
}

/**
 * Document preview data for viewer
 */
export interface DocumentPreviewData {
  documentId: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  pages?: number;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
}

/**
 * Document approval workflow configuration
 */
export interface ApprovalWorkflowConfig {
  requireDualApproval: boolean;
  autoApprovalEnabled: boolean;
  autoApprovalRules: AutoApprovalRule[];
  escalationRules: EscalationRule[];
  notificationSettings: NotificationSettings;
}

/**
 * Auto approval rule definition
 */
export interface AutoApprovalRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: ApprovalCondition[];
  actions: ApprovalAction[];
  priority: number;
}

/**
 * Approval condition for rules
 */
export interface ApprovalCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  weight: number;
}

/**
 * Approval action for rules
 */
export interface ApprovalAction {
  type: 'approve' | 'flag_for_review' | 'assign_reviewer' | 'notify';
  parameters: Record<string, any>;
}

/**
 * Escalation rule configuration
 */
export interface EscalationRule {
  id: string;
  name: string;
  triggerAfterHours: number;
  escalateTo: string[];
  notificationTemplate: string;
  enabled: boolean;
}

/**
 * Notification settings for approval workflow
 */
export interface NotificationSettings {
  enableEmailNotifications: boolean;
  enableSlackNotifications: boolean;
  enableInAppNotifications: boolean;
  templates: NotificationTemplate[];
}

/**
 * Notification template definition
 */
export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'in_app';
  subject: string;
  body: string;
  variables: string[];
}