/**
 * Storage Adapter
 * Abstract interface for different storage types
 */

import type { StorageItem } from './types';

export abstract class StorageAdapter {
  abstract setItem(key: string, value: string): void;
  abstract getItem(key: string): string | null;
  abstract removeItem(key: string): void;
  abstract clear(): void;
  abstract keys(): string[];
  abstract getSize(): number;
}

export class LocalStorageAdapter extends StorageAdapter {
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  getSize(): number {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        size += key.length + (value ? value.length : 0);
      }
    }
    return size;
  }
}

export class SessionStorageAdapter extends StorageAdapter {
  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }

  keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  getSize(): number {
    let size = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        size += key.length + (value ? value.length : 0);
      }
    }
    return size;
  }
}

export class MemoryStorageAdapter extends StorageAdapter {
  private storage = new Map<string, StorageItem<unknown>>();

  setItem(key: string, value: string): void {
    try {
      const item = JSON.parse(value);
      this.storage.set(key, item);
    } catch {
      // Store as raw string if not JSON
      this.storage.set(key, { value, timestamp: Date.now() });
    }
  }

  getItem(key: string): string | null {
    const item = this.storage.get(key);
    return item ? JSON.stringify(item) : null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  keys(): string[] {
    return Array.from(this.storage.keys());
  }

  getSize(): number {
    return JSON.stringify(Array.from(this.storage.entries())).length;
  }

  // Memory-specific methods
  getStorageItem(key: string): StorageItem<unknown> | undefined {
    return this.storage.get(key);
  }

  setStorageItem(key: string, item: StorageItem<unknown>): void {
    this.storage.set(key, item);
  }
}