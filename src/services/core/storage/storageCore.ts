/**
 * Storage Core
 * Main storage service combining all storage functionality
 */

import { LocalStorageAdapter, SessionStorageAdapter, MemoryStorageAdapter } from './storageAdapter';
import { StorageEncryption } from './encryption';
import { StorageCompression } from './compression';
import { StorageUtils } from './storageUtils';
import type { StorageType, StorageOptions, StorageItem } from './types';

export class StorageCore {
  private localStorage = new LocalStorageAdapter();
  private sessionStorage = new SessionStorageAdapter();
  private memoryStorage = new MemoryStorageAdapter();
  private encryption = new StorageEncryption();
  private compression = new StorageCompression();
  private utils = new StorageUtils();

  /**
   * Set item in storage
   */
  async set<T>(
    key: string,
    value: T,
    type: StorageType = 'local',
    options: StorageOptions = {}
  ): Promise<void> {
    const namespacedKey = this.utils.getNamespacedKey(key, options.namespace);
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      ...(options.ttl && { ttl: options.ttl }),
      ...(options.encrypt && { encrypted: options.encrypt }),
      ...(options.compress && { compressed: options.compress }),
    };

    // Handle memory storage separately due to different data structure
    if (type === 'memory') {
      this.memoryStorage.setStorageItem(namespacedKey, item);
      return;
    }

    let serializedValue = JSON.stringify(item);

    // Apply compression if requested
    if (options.compress) {
      serializedValue = await this.compression.compress(serializedValue);
    }

    // Apply encryption if requested
    if (options.encrypt) {
      serializedValue = await this.encryption.encrypt(serializedValue);
    }

    const adapter = type === 'local' ? this.localStorage : this.sessionStorage;
    adapter.setItem(namespacedKey, serializedValue);
  }

  /**
   * Get item from storage
   */
  async get<T>(
    key: string,
    type: StorageType = 'local',
    options: StorageOptions = {}
  ): Promise<T | null> {
    const namespacedKey = this.utils.getNamespacedKey(key, options.namespace);

    // Handle memory storage separately
    if (type === 'memory') {
      const memoryItem = this.memoryStorage.getStorageItem(namespacedKey);
      if (memoryItem) {
        return this.utils.validateAndReturnItem(memoryItem) as T | null;
      }
      return null;
    }

    const adapter = type === 'local' ? this.localStorage : this.sessionStorage;
    let serializedValue = adapter.getItem(namespacedKey);

    if (!serializedValue) {
      return null;
    }

    try {
      // Apply decryption if needed
      if (options.encrypt) {
        serializedValue = await this.encryption.decrypt(serializedValue);
      }

      // Apply decompression if needed
      if (options.compress) {
        serializedValue = await this.compression.decompress(serializedValue);
      }

      const item: StorageItem<T> = JSON.parse(serializedValue);
      return this.utils.validateAndReturnItem(item);
    } catch (error) {
      console.warn(`Failed to parse stored value for key ${namespacedKey}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string, type: StorageType = 'local', namespace?: string): void {
    const namespacedKey = this.utils.getNamespacedKey(key, namespace);
    const adapter = this.getAdapter(type);
    adapter.removeItem(namespacedKey);
  }

  /**
   * Clear all items from storage
   */
  clear(type: StorageType = 'local', namespace?: string): void {
    const prefix = this.utils.getNamespacedKey('', namespace);

    if (type === 'memory') {
      if (namespace) {
        Array.from(this.memoryStorage.keys())
          .filter(key => key.startsWith(prefix))
          .forEach(key => this.memoryStorage.removeItem(key));
      } else {
        this.memoryStorage.clear();
      }
      return;
    }

    const storage = type === 'local' ? localStorage : sessionStorage;
    this.utils.clearStorageByPrefix(storage, prefix);
  }

  /**
   * Get all keys from storage
   */
  keys(type: StorageType = 'local', namespace?: string): string[] {
    const prefix = this.utils.getNamespacedKey('', namespace);

    if (type === 'memory') {
      return Array.from(this.memoryStorage.keys())
        .filter(key => key.startsWith(prefix))
        .map(key => key.replace(prefix, ''));
    }

    const storage = type === 'local' ? localStorage : sessionStorage;
    return this.utils.getKeysByPrefix(storage, prefix);
  }

  /**
   * Check if key exists in storage
   */
  async exists(key: string, type: StorageType = 'local', namespace?: string): Promise<boolean> {
    const value = await this.get(key, type, namespace ? { namespace } : {});
    return value !== null;
  }

  /**
   * Get storage size in bytes (approximate)
   */
  getSize(type: StorageType = 'local'): number {
    const adapter = this.getAdapter(type);
    return adapter.getSize();
  }

  /**
   * Clean expired items
   */
  cleanExpired(type: StorageType = 'local', namespace?: string): void {
    const keys = this.keys(type, namespace);

    keys.forEach(async (key) => {
      try {
        const value = await this.get(key, type, namespace ? { namespace } : {});
        if (value === null) {
          // Item was expired and removed during get()
          // No additional action needed
        }
      } catch (error) {
        // Remove corrupted items
        this.remove(key, type, namespace);
      }
    });
  }

  /**
   * Get storage adapter for type
   */
  private getAdapter(type: StorageType) {
    switch (type) {
      case 'local':
        return this.localStorage;
      case 'session':
        return this.sessionStorage;
      case 'memory':
        return this.memoryStorage;
      default:
        return this.localStorage;
    }
  }
}