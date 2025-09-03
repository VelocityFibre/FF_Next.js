/**
 * Authentication Types
 * Type definitions for authentication services
 */

import { User as FirebaseUser } from 'firebase/auth';
import { User, LoginCredentials, RegisterCredentials, PasswordResetRequest } from '@/types/auth.types';
import { AuthUser } from '../authHelpers';

export interface AuthenticationMethods {
  // Email/Password methods
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signInWithEmailEnhanced(credentials: LoginCredentials): Promise<User>;
  registerWithEmail(credentials: RegisterCredentials): Promise<User>;
  signUp(email: string, password: string, displayName?: string): Promise<AuthUser>;

  // Google OAuth methods
  signInWithGoogle(): Promise<AuthUser>;
  signInWithGoogleEnhanced(rememberMe?: boolean): Promise<User>;

  // Password management
  resetPassword(email: string): Promise<void>;
  resetPasswordEnhanced(request: PasswordResetRequest): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;

  // Sign out
  signOut(): Promise<void>;
}

export interface UserMethods {
  // User state
  getCurrentUser(): AuthUser | null;
  getCurrentUserEnhanced(): Promise<User | null>;
  isAuthenticated(): boolean;
  waitForAuth(): Promise<FirebaseUser | null>;

  // User profile
  updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void>;
  sendEmailVerification(): Promise<void>;
}

export interface AuthStateMethods {
  // Auth state listeners
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  onAuthStateChangedEnhanced(callback: (user: User | null) => void): () => void;
}

export interface PermissionMethods {
  // Permission checks
  hasPermission(permission: string): boolean;
  hasAnyPermission(permissions: string[]): boolean;
  hasAllPermissions(permissions: string[]): boolean;

  // Role checks
  hasRole(role: string): boolean;
  hasAnyRole(roles: string[]): boolean;
}