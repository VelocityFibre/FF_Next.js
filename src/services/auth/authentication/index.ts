/**
 * Authentication Service
 * Centralized exports for all authentication functionality
 */

// Core authentication
export { AuthCore } from './authCore';

// Individual authentication modules
export { EmailAuthentication } from './emailAuth';
export { GoogleAuthentication } from './googleAuth';
export { UserState } from './userState';
export { AuthState } from './authState';
export { PermissionManager } from './permissions';

// Types
export type {
  AuthenticationMethods,
  UserMethods,
  AuthStateMethods,
  PermissionMethods,
} from './types';

// Create and export singleton instance
import { AuthCore } from './authCore';
export const authService = new AuthCore();

// Export class for legacy compatibility
export { AuthCore as AuthService };