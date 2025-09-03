/**
 * Storage Types
 * Type definitions for storage services
 */

export type StorageType = 'local' | 'session' | 'memory';

export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
  namespace?: string;
}

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  encrypted?: boolean;
  compressed?: boolean;
}