import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
} from '@/types/auth.types';
import { 
  createUserProfile,
  getUserProfile,
  updateLastLogin,
  getUserFromFirestore,
} from './userService';
import { 
  AuthUser,
  mapFirebaseUser,
  handleAuthError,
} from './authHelpers';

class AuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }

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

  /**
   * Sign up with email and password (legacy method)
   */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await result.user.updateDisplayName(displayName);
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
        displayName: credentials.displayName,
        phoneNumber: credentials.phoneNumber,
        department: credentials.department,
      });

      return user;
    } catch (error: unknown) {
      throw handleAuthError(error);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
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
        url: request.redirectUrl || `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
    } catch (error) {
      throw handleAuthError(error);
    }
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
      console.error('Error getting current user:', error);
      return null;
    }
  }

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
          console.error('Error in auth state change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
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
}

export const authService = new AuthService();