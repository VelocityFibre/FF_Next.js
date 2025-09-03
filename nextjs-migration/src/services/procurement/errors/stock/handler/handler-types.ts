/**
 * Stock Error Handler Types
 * TypeScript interfaces and types for error handling
 */

export interface RecoveryOption {
  type: string;
  description: string;
  action: string;
  data: any;
  priority?: number;
  estimatedTime?: string;
  cost?: number;
}

export interface RetryStrategy {
  type: string;
  description: string;
  action: string;
  data: any;
  maxAttempts?: number;
  backoffMs?: number;
}

export interface HandlerResult<T = any> {
  error: T;
  recoveryOptions: RecoveryOption[];
  retryStrategy?: RetryStrategy;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoRecoverable: boolean;
  requiresManualIntervention: boolean;
}

export interface ErrorHandlerConfig {
  maxRetryAttempts: number;
  baseBackoffMs: number;
  maxBackoffMs: number;
  enableAutoRecovery: boolean;
  notifyOnFailure: boolean;
  escalationLevel: 'none' | 'supervisor' | 'manager' | 'director';
}