/**
 * StorageService - Legacy Compatibility Layer
 * @deprecated Use imports from @/services/core/storage instead
 * 
 * This file provides backward compatibility for existing imports.
 * New code should import directly from the modular structure:
 * - import { storageService } from '@/services/core/storage'
 * 
 * Original file: 333 lines → Split into focused modules
 */

// Re-export everything from the new modular structure
export {
  StorageService,
  storageService,
  type StorageType,
  type StorageOptions,
  type StorageItem,
} from './storage';

// Export as default for backward compatibility
export { StorageService as default } from './storage';