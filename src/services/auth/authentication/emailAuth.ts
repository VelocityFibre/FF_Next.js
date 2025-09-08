/**
 * Email Authentication
 * Email and password authentication methods
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  updateProfile,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { LoginCredentials, RegisterCredentials, PasswordResetRequest, User } from '@/types/auth.types';
import { createUserProfile, getUserProfile, updateLastLogin } from '../userService';
import { AuthUser, mapFirebaseUser, handleAuthError } from '../authHelpers';

export class EmailAuthentication {
  /**
   * Sign in with email and password (legacy method)
   */
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await updateLastLogin(result.user.uid);
    return mapFirebaseUser(result.user);
  }

  /**
   * Sign in with email and password (enhanced method)
   */
  async signInWithEmailEnhanced(credentials: LoginCredentials): Promise<User> {
    try {
      // Set persistence based on rememberMe
      const persistence = credentials.rememberMe 
        ? browserLocalPersistence 
        : browserSessionPersistence;
      
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update last login time
      await updateLastLogin(userCredential.user.uid);

      // Get user profile from Firestore
      const user = await getUserProfile(userCredential.user);
      return user;
    } catch (error: unknown) {
      throw handleAuthError(error);
    }
  }

  /**
   * Sign up with email and password (legacy method)
   */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return mapFirebaseUser(result.user);
  }

  /**
   * Register with email and password (enhanced method)
   */
  async registerWithEmail(credentials: RegisterCredentials): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Create user profile in Firestore
      const user = await createUserProfile(userCredential.user, {
        displayName: `${credentials.firstName} ${credentials.lastName}`.trim(),
      });

      return user;
    } catch (error: unknown) {
      throw handleAuthError(error);
    }
  }

  /**
   * Reset password (legacy method)
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Reset password (enhanced method)
   */
  async resetPasswordEnhanced(request: PasswordResetRequest): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, request.email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
    } catch (error) {
      throw handleAuthError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }
    
    // Re-authenticate first
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  }
}