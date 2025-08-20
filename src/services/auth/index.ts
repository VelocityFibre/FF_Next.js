// Main auth service exports
export { authService } from './authService';
export type { AuthUser } from './authHelpers';

// User service exports
export {
  createUserProfile,
  getUserProfile,
  getUserFromFirestore,
  updateLastLogin,
  updateUserProfile,
  getUserByEmail,
  changeUserPassword,
  sendUserEmailVerification,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from './userService';

// Helper exports
export {
  mapFirebaseUser,
  handleAuthError,
} from './authHelpers';

// Re-export all functions from authService for backward compatibility
import { authService } from './authService';

export const signInWithEmail = authService.signInWithEmail.bind(authService);
export const signInWithEmailEnhanced = authService.signInWithEmailEnhanced.bind(authService);
export const signInWithGoogle = authService.signInWithGoogle.bind(authService);
export const signInWithGoogleEnhanced = authService.signInWithGoogleEnhanced.bind(authService);
export const signUp = authService.signUp.bind(authService);
export const registerWithEmail = authService.registerWithEmail.bind(authService);
export const signOut = authService.signOut.bind(authService);
export const resetPassword = authService.resetPassword.bind(authService);
export const resetPasswordEnhanced = authService.resetPasswordEnhanced.bind(authService);
export const getCurrentUser = authService.getCurrentUser.bind(authService);
export const getCurrentUserEnhanced = authService.getCurrentUserEnhanced.bind(authService);
export const onAuthStateChanged = authService.onAuthStateChanged.bind(authService);
export const onAuthStateChangedEnhanced = authService.onAuthStateChangedEnhanced.bind(authService);
export const isAuthenticated = authService.isAuthenticated.bind(authService);
export const waitForAuth = authService.waitForAuth.bind(authService);