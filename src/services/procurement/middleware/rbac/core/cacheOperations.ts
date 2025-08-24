/**
 * Cache Operations
 * Handles permission cache management and cleanup
 */

import { PermissionCacheManager } from '../cacheManager';

/**
 * Cache management operations
 */
export class CacheOperations {
  private cacheManager: PermissionCacheManager;

  constructor(cacheManager: PermissionCacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * Clear permission cache for a user
   */
  async clearUserPermissionCache(userId: string, projectId?: string): Promise<void> {
    if (projectId) {
      this.cacheManager.clearUserProjectCache(userId, projectId);
    } else {
      this.cacheManager.clearUserCache(userId);
    }
  }

  /**
   * Clear permission cache for a project
   */
  async clearProjectPermissionCache(projectId: string): Promise<void> {
    this.cacheManager.clearProjectCache(projectId);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cacheManager.getCacheStats();
  }

  /**
   * Manually cleanup expired cache entries
   */
  cleanupCache(): number {
    return this.cacheManager.cleanupExpiredEntries();
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    this.cacheManager.destroy();
  }
}