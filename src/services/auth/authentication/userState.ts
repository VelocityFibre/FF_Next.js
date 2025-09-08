/**
 * User State Management
 * User state and profile management methods
 */

import {
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { User } from '@/types/auth.types';
import { getUserProfile, getUserFromFirestore } from '../userService';
import { AuthUser, mapFirebaseUser } from '../authHelpers';

export class UserState {
  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Get current user (legacy method)
   */
  getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? mapFirebaseUser(user) : null;
  }

  /**
   * Get current user (enhanced method)
   */
  async getCurrentUserEnhanced(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return null;
    }

    try {
      // Try to get from Firestore first
      const firestoreUser = await getUserFromFirestore(firebaseUser.uid);
      if (firestoreUser) {
        return firestoreUser;
      }

      // If not in Firestore, create profile
      return await getUserProfile(firebaseUser);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Wait for auth to be ready
   */
  async waitForAuth(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    await updateProfile(user, updates);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    await sendEmailVerification(user);
  }
}