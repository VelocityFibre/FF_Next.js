/**
 * Supplier Status - Core Types
 * Shared types for supplier status management
 */

import { SupplierStatus, Supplier } from '@/types/supplier/base.types';

// Re-export for convenience
export { SupplierStatus } from '@/types/supplier/base.types';

export interface StatusUpdateData {
  status: SupplierStatus;
  reason?: string;
  userId?: string;
}

export interface BatchOperationResult {
  success: string[];
  failed: Array<{ id: string; error: string }>;
}

export interface PreferenceUpdateResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface StatusHistoryEntry {
  status: SupplierStatus;
  timestamp: Date;
  reason?: string;
  changedBy?: string;
}

export interface StatusTransitionValidation {
  valid: boolean;
  reason?: string;
}

export interface SupplierEligibility {
  canReceiveRFQ: boolean;
  canSubmitQuote: boolean;
  canReceiveOrders: boolean;
  restrictions: string[];
}

export interface PreferenceUpdate {
  id: string;
  isPreferred: boolean;
}

export type StatusSummary = Record<SupplierStatus, number>;

export type { Supplier };