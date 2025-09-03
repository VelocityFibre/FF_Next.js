/**
 * Authentication Core
 * Main authentication service combining all authentication modules
 */

import { EmailAuthentication } from './emailAuth';
import { GoogleAuthentication } from './googleAuth';
import { UserState } from './userState';
import { AuthState } from './authState';
import { PermissionManager } from './permissions';
import type {
  AuthenticationMethods,
  UserMethods,
  AuthStateMethods,
  PermissionMethods,
} from './types';

export class AuthCore implements
  AuthenticationMethods,
  UserMethods,
  AuthStateMethods,
  PermissionMethods
{
  private emailAuth = new EmailAuthentication();
  private googleAuth = new GoogleAuthentication();
  private userState = new UserState();
  private authState = new AuthState();
  private permissions = new PermissionManager();

  // Email/Password authentication
  signInWithEmail = (email: string, password: string) =>
    this.emailAuth.signInWithEmail(email, password);

  signInWithEmailEnhanced = (credentials: any) =>
    this.emailAuth.signInWithEmailEnhanced(credentials);

  signUp = (email: string, password: string, displayName?: string) =>
    this.emailAuth.signUp(email, password, displayName);

  registerWithEmail = (credentials: any) =>
    this.emailAuth.registerWithEmail(credentials);

  resetPassword = (email: string) =>
    this.emailAuth.resetPassword(email);

  resetPasswordEnhanced = (request: any) =>
    this.emailAuth.resetPasswordEnhanced(request);

  changePassword = (currentPassword: string, newPassword: string) =>
    this.emailAuth.changePassword(currentPassword, newPassword);

  // Google OAuth
  signInWithGoogle = () =>
    this.googleAuth.signInWithGoogle();

  signInWithGoogleEnhanced = (rememberMe?: boolean) =>
    this.googleAuth.signInWithGoogleEnhanced(rememberMe);

  // User state management
  signOut = () =>
    this.userState.signOut();

  getCurrentUser = () =>
    this.userState.getCurrentUser();

  getCurrentUserEnhanced = () =>
    this.userState.getCurrentUserEnhanced();

  isAuthenticated = () =>
    this.userState.isAuthenticated();

  waitForAuth = () =>
    this.userState.waitForAuth();

  updateUserProfile = (updates: { displayName?: string; photoURL?: string }) =>
    this.userState.updateUserProfile(updates);

  sendEmailVerification = () =>
    this.userState.sendEmailVerification();

  // Auth state listeners
  onAuthStateChanged = (callback: any) =>
    this.authState.onAuthStateChanged(callback);

  onAuthStateChangedEnhanced = (callback: any) =>
    this.authState.onAuthStateChangedEnhanced(callback);

  // Permissions and roles
  hasPermission = (permission: string) =>
    this.permissions.hasPermission(permission);

  hasAnyPermission = (permissions: string[]) =>
    this.permissions.hasAnyPermission(permissions);

  hasAllPermissions = (permissions: string[]) =>
    this.permissions.hasAllPermissions(permissions);

  hasRole = (role: string) =>
    this.permissions.hasRole(role);

  hasAnyRole = (roles: string[]) =>
    this.permissions.hasAnyRole(roles);
}