/**
 * RBAC Middleware - Main Instance
 * Provides the main RBAC middleware instance with automatic cleanup
 */

import { RBACCore } from './rbacCore';

// Create main RBAC middleware instance
export const rbacMiddleware = new RBACCore(10 * 60 * 1000); // 10 minutes cache TTL

// Set up periodic cache cleanup every 10 minutes
const cleanupInterval = setInterval(() => {
  rbacMiddleware.cleanupCache();
}, 10 * 60 * 1000);

// Cleanup on browser page unload (browser-compatible)
if (typeof window !== 'undefined') {
  // Browser environment - cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
    rbacMiddleware.destroy();
  });
} else if (typeof process !== 'undefined') {
  // Node.js environment - cleanup on process termination
  process.on('SIGTERM', () => {
    clearInterval(cleanupInterval);
    rbacMiddleware.destroy();
  });

  process.on('SIGINT', () => {
    clearInterval(cleanupInterval);
    rbacMiddleware.destroy();
  });
}

// Export as default for backward compatibility
export default rbacMiddleware;