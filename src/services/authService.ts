import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import {
  User,
  UserRole,
  Permission,
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
  ChangePasswordRequest,
  AuthError,
  ROLE_PERMISSIONS,
  DEFAULT_USER_PREFERENCES,
} from '@/types/auth.types';

// Legacy interface for backward compatibility
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

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
    await this.updateLastLogin(result.user.uid);
    return this.mapUser(result.user);
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
      await this.updateLastLogin(userCredential.user.uid);

      // Get user profile from Firestore
      const user = await this.getUserProfile(userCredential.user);
      return user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google (legacy method)
   */
  async signInWithGoogle(): Promise<AuthUser> {
    const result = await signInWithPopup(auth, this.googleProvider);
    await this.updateLastLogin(result.user.uid);
    return this.mapUser(result.user);
  }

  /**
   * Sign in with Google (enhanced method)
   */
  async signInWithGoogleEnhanced(rememberMe = false): Promise<User> {
    try {
      // Set persistence based on rememberMe
      const persistence = rememberMe 
        ? browserLocalPersistence 
        : browserSessionPersistence;
      
      await setPersistence(auth, persistence);

      const userCredential = await signInWithPopup(auth, this.googleProvider);
      const firebaseUser = userCredential.user;

      // Check if user exists in Firestore
      let user = await this.getUserFromFirestore(firebaseUser.uid);

      if (!user) {
        // Create new user profile
        user = await this.createUserProfile(firebaseUser, UserRole.VIEWER);
      } else {
        // Update last login time
        await this.updateLastLogin(firebaseUser.uid);
      }

      return user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create new user account (legacy method)
   */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    return this.mapUser(result.user);
  }

  /**
   * Register new user with email and password (enhanced method)
   */
  async registerWithEmail(credentials: RegisterCredentials): Promise<User> {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${credentials.firstName} ${credentials.lastName}`,
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user profile in Firestore
      const role = credentials.role || UserRole.VIEWER;
      const user = await this.createUserProfile(firebaseUser, role, {
        profile: {
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          preferences: DEFAULT_USER_PREFERENCES,
        },
      });

      return user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email (legacy method)
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Send password reset email (enhanced method)
   */
  async resetPasswordEnhanced(request: PasswordResetRequest): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, request.email);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user');
      }

      if (request.newPassword !== request.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email,
        request.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, request.newPassword);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      await sendEmailVerification(user);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user (legacy method)
   */
  getCurrentUser(): AuthUser | null {
    return auth.currentUser ? this.mapUser(auth.currentUser) : null;
  }

  /**
   * Get current user (enhanced method)
   */
  async getCurrentUserEnhanced(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      return await this.getUserProfile(firebaseUser);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Subscribe to auth state changes (legacy method)
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? this.mapUser(user) : null);
    });
  }

  /**
   * Subscribe to authentication state changes (enhanced method)
   */
  onAuthStateChangedEnhanced(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await this.getUserProfile(firebaseUser);
          callback(user);
        } catch (error) {
          console.error('Error getting user profile:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has role
   */
  hasRole(user: User, role: UserRole): boolean {
    return user.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(user: User, roles: UserRole[]): boolean {
    return roles.includes(user.role);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Create user profile in Firestore
   */
  private async createUserProfile(
    firebaseUser: FirebaseUser,
    role: UserRole,
    additionalData?: Partial<User>
  ): Promise<User> {
    const permissions = ROLE_PERMISSIONS[role] || [];
    
    const user: Omit<User, 'id'> = {
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role,
      permissions,
      isEmailVerified: firebaseUser.emailVerified,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      profile: {
        preferences: DEFAULT_USER_PREFERENCES,
        ...additionalData?.profile,
      },
      ...additionalData,
    };

    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    return {
      id: firebaseUser.uid,
      ...user,
    };
  }

  /**
   * Get user profile from Firestore
   */
  private async getUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const user = await this.getUserFromFirestore(firebaseUser.uid);
    
    if (!user) {
      // Create new user profile if it doesn't exist
      return await this.createUserProfile(firebaseUser, UserRole.VIEWER);
    }

    // Update Firebase user data if it has changed
    const updates: Partial<User> = {};
    
    if (user.email !== firebaseUser.email) {
      updates.email = firebaseUser.email!;
    }
    
    if (user.displayName !== firebaseUser.displayName) {
      updates.displayName = firebaseUser.displayName;
    }
    
    if (user.photoURL !== firebaseUser.photoURL) {
      updates.photoURL = firebaseUser.photoURL;
    }
    
    if (user.isEmailVerified !== firebaseUser.emailVerified) {
      updates.isEmailVerified = firebaseUser.emailVerified;
    }

    if (Object.keys(updates).length > 0) {
      await this.updateUserProfile(firebaseUser.uid, updates);
      return { ...user, ...updates };
    }

    return user;
  }

  /**
   * Get user from Firestore by ID
   */
  private async getUserFromFirestore(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return null;

      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
    } catch (error) {
      console.error('Error getting user from Firestore:', error);
      return null;
    }
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Map Firebase user to our AuthUser interface (legacy)
   */
  private mapUser(user: FirebaseUser): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: unknown): AuthError {
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          return {
            code: 'user-not-found',
            message: 'No user found with this email address.',
          };
        case 'auth/wrong-password':
          return {
            code: 'wrong-password',
            message: 'Incorrect password.',
          };
        case 'auth/invalid-email':
          return {
            code: 'invalid-email',
            message: 'Invalid email address.',
          };
        case 'auth/user-disabled':
          return {
            code: 'user-disabled',
            message: 'This user account has been disabled.',
          };
        case 'auth/email-already-in-use':
          return {
            code: 'email-already-in-use',
            message: 'An account with this email already exists.',
          };
        case 'auth/weak-password':
          return {
            code: 'weak-password',
            message: 'Password should be at least 6 characters.',
          };
        case 'auth/too-many-requests':
          return {
            code: 'too-many-requests',
            message: 'Too many failed attempts. Please try again later.',
          };
        case 'auth/popup-closed-by-user':
          return {
            code: 'popup-closed',
            message: 'Sign-in popup was closed before completion.',
          };
        case 'auth/cancelled-popup-request':
          return {
            code: 'popup-cancelled',
            message: 'Sign-in was cancelled.',
          };
        default:
          return {
            code: firebaseError.code,
            message: firebaseError.message,
          };
      }
    }

    return {
      code: 'unknown-error',
      message: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}

export const authService = new AuthService();