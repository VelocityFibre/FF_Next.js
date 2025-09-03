/**
 * Storage Utilities
 * Helper functions for storage operations
 */

import type { StorageType, StorageItem } from './types';

export class StorageUtils {
  private defaultNamespace = 'fibreflow';

  /**
   * Generate namespaced key
   * @param key Original key
   * @param namespace Optional namespace
   * @returns Namespaced key
   */
  getNamespacedKey(key: string, namespace?: string): string {
    const ns = namespace || this.defaultNamespace;
    return `${ns}:${key}`;
  }

  /**
   * Validate and return item, checking for expiration
   * @param item Storage item
   * @returns Item value or null if expired
   */
  validateAndReturnItem<T>(item: StorageItem<T>): T | null {
    const now = Date.now();
    
    // Check if item has expired
    if (item.ttl && now - item.timestamp > item.ttl) {
      return null;
    }

    return item.value;
  }

  /**
   * Clear storage by prefix
   * @param storage Web Storage instance
   * @param prefix Key prefix to match
   */
  clearStorageByPrefix(storage: Storage, prefix: string): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  /**
   * Get keys by prefix from storage
   * @param storage Web Storage instance
   * @param prefix Key prefix to match
   * @returns Array of matching keys (without prefix)
   */
  getKeysByPrefix(storage: Storage, prefix: string): string[] {
    const keys: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.replace(prefix, ''));
      }
    }
    
    return keys;
  }

  /**
   * Calculate total storage size
   * @param storage Web Storage instance
   * @returns Size in bytes
   */
  calculateStorageSize(storage: Storage): number {
    let size = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const value = storage.getItem(key);
        size += key.length + (value ? value.length : 0);
      }
    }
    return size;
  }

  /**
   * Check if storage is available
   * @param type Storage type to check
   * @returns True if storage is available
   */
  isStorageAvailable(type: StorageType): boolean {
    try {
      const storage = type === 'local' ? localStorage : 
                    type === 'session' ? sessionStorage : null;
      
      if (!storage) return type === 'memory'; // Memory storage is always available
      
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage quota information (if available)
   * @returns Storage quota info or null
   */
  async getStorageQuota(): Promise<{ used: number; total: number } | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          total: estimate.quota || 0,
        };
      }
    } catch {
      // Storage quota not available
    }
    return null;
  }
}