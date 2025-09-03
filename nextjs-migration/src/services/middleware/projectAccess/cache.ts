/**
 * Project Access Cache Service
 * Handles caching for project access data
 */

import { UserProjectAccess, CacheEntry } from './types';

/**
 * Project access cache management
 */
export class ProjectAccessCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached project access data
   */
  get(userId: string): UserProjectAccess[] | null {
    const cacheKey = `user_projects_${userId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }

    return null;
  }

  /**
   * Set project access data in cache
   */
  set(userId: string, data: UserProjectAccess[]): void {
    const cacheKey = `user_projects_${userId}`;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Remove cached data for user
   */
  delete(userId: string): void {
    const cacheKey = `user_projects_${userId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
  } {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const cached of this.cache.values()) {
      if (now - cached.timestamp < this.CACHE_TTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries
    };
  }
}