/**
 * Authentication State
 * Authentication state listeners and change handlers
 */

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { User } from '@/types/auth.types';
import { getUserProfile } from '../userService';
import { AuthUser, mapFirebaseUser } from '../authHelpers';

export class AuthState {
  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  }

  /**
   * Subscribe to auth state changes (enhanced)
   */
  onAuthStateChangedEnhanced(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await getUserProfile(firebaseUser);
          callback(user);
        } catch (error) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}