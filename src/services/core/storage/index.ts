/**
 * Storage Service
 * Centralized exports for all storage functionality
 */

// Core storage
export { StorageCore } from './storageCore';

// Individual components
export { LocalStorageAdapter, SessionStorageAdapter, MemoryStorageAdapter } from './storageAdapter';
export { StorageEncryption } from './encryption';
export { StorageCompression } from './compression';
export { StorageUtils } from './storageUtils';

// Types
export type {
  StorageType,
  StorageOptions,
  StorageItem,
} from './types';

// Create and export singleton instance
import { StorageCore } from './storageCore';
export const storageService = new StorageCore();

// Export class for legacy compatibility
export { StorageCore as StorageService };