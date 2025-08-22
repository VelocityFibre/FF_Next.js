/**
 * StorageService - Unified storage management
 * Provides consistent data persistence across localStorage, sessionStorage, and IndexedDB
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

class StorageService {
  private memoryStorage = new Map<string, StorageItem<unknown>>();
  private defaultNamespace = 'fibreflow';

  /**
   * Set item in storage
   */
  async set<T>(
    key: string,
    value: T,
    type: StorageType = 'local',
    options: StorageOptions = {}
  ): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key, options.namespace);
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      ...(options.ttl && { ttl: options.ttl }),
      ...(options.encrypt && { encrypted: options.encrypt }),
      ...(options.compress && { compressed: options.compress }),
    };

    let serializedValue = JSON.stringify(item);

    // Apply compression if requested
    if (options.compress) {
      serializedValue = await this.compress(serializedValue);
    }

    // Apply encryption if requested
    if (options.encrypt) {
      serializedValue = await this.encrypt(serializedValue);
    }

    switch (type) {
      case 'local':
        localStorage.setItem(namespacedKey, serializedValue);
        break;
      case 'session':
        sessionStorage.setItem(namespacedKey, serializedValue);
        break;
      case 'memory':
        this.memoryStorage.set(namespacedKey, item);
        break;
    }
  }

  /**
   * Get item from storage
   */
  async get<T>(
    key: string,
    type: StorageType = 'local',
    options: StorageOptions = {}
  ): Promise<T | null> {
    const namespacedKey = this.getNamespacedKey(key, options.namespace);
    let serializedValue: string | null = null;

    switch (type) {
      case 'local':
        serializedValue = localStorage.getItem(namespacedKey);
        break;
      case 'session':
        serializedValue = sessionStorage.getItem(namespacedKey);
        break;
      case 'memory': {
        const memoryItem = this.memoryStorage.get(namespacedKey);
        if (memoryItem) {
          return this.validateAndReturnItem(memoryItem) as T | null;
        }
        return null;
      }
    }

    if (!serializedValue) {
      return null;
    }

    try {
      // Apply decryption if needed
      if (options.encrypt) {
        serializedValue = await this.decrypt(serializedValue);
      }

      // Apply decompression if needed
      if (options.compress) {
        serializedValue = await this.decompress(serializedValue);
      }

      const item: StorageItem<T> = JSON.parse(serializedValue);
      return this.validateAndReturnItem(item);
    } catch (error) {
      console.warn(`Failed to parse stored value for key ${namespacedKey}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string, type: StorageType = 'local', namespace?: string): void {
    const namespacedKey = this.getNamespacedKey(key, namespace);

    switch (type) {
      case 'local':
        localStorage.removeItem(namespacedKey);
        break;
      case 'session':
        sessionStorage.removeItem(namespacedKey);
        break;
      case 'memory':
        this.memoryStorage.delete(namespacedKey);
        break;
    }
  }

  /**
   * Clear all items from storage
   */
  clear(type: StorageType = 'local', namespace?: string): void {
    const prefix = this.getNamespacedKey('', namespace);

    switch (type) {
      case 'local': {
        this.clearStorageByPrefix(localStorage, prefix);
        break;
      }
      case 'session': {
        this.clearStorageByPrefix(sessionStorage, prefix);
        break;
      }
      case 'memory': {
        if (namespace) {
          Array.from(this.memoryStorage.keys())
            .filter(key => key.startsWith(prefix))
            .forEach(key => this.memoryStorage.delete(key));
        } else {
          this.memoryStorage.clear();
        }
        break;
      }
    }
  }

  /**
   * Get all keys from storage
   */
  keys(type: StorageType = 'local', namespace?: string): string[] {
    const prefix = this.getNamespacedKey('', namespace);

    switch (type) {
      case 'local':
        return this.getKeysByPrefix(localStorage, prefix);
      case 'session':
        return this.getKeysByPrefix(sessionStorage, prefix);
      case 'memory':
        return Array.from(this.memoryStorage.keys())
          .filter(key => key.startsWith(prefix))
          .map(key => key.replace(prefix, ''));
      default:
        return [];
    }
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
    switch (type) {
      case 'local':
        return this.calculateStorageSize(localStorage);
      case 'session':
        return this.calculateStorageSize(sessionStorage);
      case 'memory':
        return JSON.stringify(Array.from(this.memoryStorage.entries())).length;
      default:
        return 0;
    }
  }

  /**
   * Clean expired items
   */
  cleanExpired(type: StorageType = 'local', namespace?: string): void {
    const keys = this.keys(type, namespace);
    const now = Date.now();

    keys.forEach(async (key) => {
      try {
        const namespacedKey = this.getNamespacedKey(key, namespace);
        let serializedValue: string | null = null;

        switch (type) {
          case 'local':
            serializedValue = localStorage.getItem(namespacedKey);
            break;
          case 'session':
            serializedValue = sessionStorage.getItem(namespacedKey);
            break;
          case 'memory': {
            const item = this.memoryStorage.get(namespacedKey);
            if (item && item.ttl && now - item.timestamp > item.ttl) {
              this.memoryStorage.delete(namespacedKey);
            }
            return;
          }
        }

        if (serializedValue) {
          const item: StorageItem<unknown> = JSON.parse(serializedValue);
          if (item.ttl && now - item.timestamp > item.ttl) {
            this.remove(key, type, namespace);
          }
        }
      } catch (error) {
        // Remove corrupted items
        this.remove(key, type, namespace);
      }
    });
  }

  // Private helper methods

  private getNamespacedKey(key: string, namespace?: string): string {
    const ns = namespace || this.defaultNamespace;
    return `${ns}:${key}`;
  }

  private validateAndReturnItem<T>(item: StorageItem<T>): T | null {
    const now = Date.now();
    
    // Check if item has expired
    if (item.ttl && now - item.timestamp > item.ttl) {
      return null;
    }

    return item.value;
  }

  private clearStorageByPrefix(storage: Storage, prefix: string): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  private getKeysByPrefix(storage: Storage, prefix: string): string[] {
    const keys: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.replace(prefix, ''));
      }
    }
    
    return keys;
  }

  private calculateStorageSize(storage: Storage): number {
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

  // Placeholder methods for encryption/compression
  // In a real implementation, these would use proper crypto libraries
  private async encrypt(data: string): Promise<string> {
    // TODO: Implement proper encryption
    return btoa(data);
  }

  private async decrypt(data: string): Promise<string> {
    // TODO: Implement proper decryption
    return atob(data);
  }

  private async compress(data: string): Promise<string> {
    // TODO: Implement compression (e.g., using pako)
    return data;
  }

  private async decompress(data: string): Promise<string> {
    // TODO: Implement decompression
    return data;
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default StorageService;