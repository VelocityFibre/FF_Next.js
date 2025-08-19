import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

class AuthService {
  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return this.mapUser(result.user);
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthUser> {
    const result = await signInWithPopup(auth, googleProvider);
    return this.mapUser(result.user);
  }

  /**
   * Create new user account
   */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    return this.mapUser(result.user);
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return auth.currentUser ? this.mapUser(auth.currentUser) : null;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? this.mapUser(user) : null);
    });
  }

  /**
   * Map Firebase user to our AuthUser interface
   */
  private mapUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
  }
}

export const authService = new AuthService();