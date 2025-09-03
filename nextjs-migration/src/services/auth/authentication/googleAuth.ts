/**
 * Google Authentication
 * Google OAuth authentication methods
 */

import {
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User } from '@/types/auth.types';
import { getUserProfile, updateLastLogin } from '../userService';
import { AuthUser, mapFirebaseUser, handleAuthError } from '../authHelpers';

export class GoogleAuthentication {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }

  /**
   * Sign in with Google (legacy method)
   */
  async signInWithGoogle(): Promise<AuthUser> {
    const result = await signInWithPopup(auth, this.googleProvider);
    await updateLastLogin(result.user.uid);
    return mapFirebaseUser(result.user);
  }

  /**
   * Sign in with Google (enhanced method)
   */
  async signInWithGoogleEnhanced(rememberMe = false): Promise<User> {
    try {
      // Set persistence
      const persistence = rememberMe 
        ? browserLocalPersistence 
        : browserSessionPersistence;
      
      await setPersistence(auth, persistence);

      const result = await signInWithPopup(auth, this.googleProvider);

      // Create or get user profile
      const user = await getUserProfile(result.user);

      // Update last login
      await updateLastLogin(result.user.uid);

      return user;
    } catch (error: unknown) {
      throw handleAuthError(error);
    }
  }
}