/**
 * Subscription Types
 * Type definitions for RFQ subscription management
 */

import { RFQStatus } from '@/types/procurement.types';

export interface SubscriptionFilter {
  projectId?: string;
  status?: RFQStatus;
  supplierId?: string;
}

export interface SubscriptionOptions {
  includeResponses?: boolean;
  includeUpdates?: boolean;
  includeComments?: boolean;
  enableBatching?: boolean;
  batchTimeout?: number;
}

export interface SubscriptionCallback<T> {
  (data: T): void;
}

export interface SubscriptionInfo {
  id: string;
  type: 'single' | 'list' | 'responses' | 'project';
  active: boolean;
  createdAt: Date;
  lastUpdate: Date;
}

export interface SubscriptionManager {
  subscribe<T>(
    type: string,
    filter: SubscriptionFilter,
    callback: SubscriptionCallback<T>,
    options?: SubscriptionOptions
  ): () => void;
  
  unsubscribe(id: string): void;
  getActiveSubscriptions(): SubscriptionInfo[];
}