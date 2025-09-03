import {
  User as FirebaseUser,
  updateProfile,
  updatePassword,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
  ChangePasswordRequest,
  ROLE_PERMISSIONS,
} from '@/types/auth.types';
import { handleAuthError } from './authHelpers';

/**
 * Creates a new user profile in Firestore
 */
export async function createUserProfile(
  firebaseUser: FirebaseUser,
  additionalData?: Partial<User>
): Promise<User> {
  const userDoc = doc(db, 'users', firebaseUser.uid);
  
  // Check if user already exists
  const userSnapshot = await getDoc(userDoc);
  if (userSnapshot.exists()) {
    return userSnapshot.data() as User;
  }

  // Create new user profile
  const newUser: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || additionalData?.displayName || '',
    photoURL: firebaseUser.photoURL || null,
    role: UserRole.VIEWER,
    permissions: ROLE_PERMISSIONS[UserRole.VIEWER],
    isEmailVerified: firebaseUser.emailVerified,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    ...additionalData,
  };

  await setDoc(userDoc, newUser);
  return newUser;
}

/**
 * Gets user profile from Firestore
 */
export async function getUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  const userDoc = doc(db, 'users', firebaseUser.uid);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data() as User;
    // Update Firebase auth fields in case they changed
    if (
      userData.email !== firebaseUser.email ||
      userData.displayName !== firebaseUser.displayName ||
      userData.photoURL !== firebaseUser.photoURL ||
      userData.isEmailVerified !== firebaseUser.emailVerified
    ) {
      const updates = {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isEmailVerified: firebaseUser.emailVerified,
      };
      await updateDoc(userDoc, updates);
      return { 
        ...userData, 
        ...updates,
        email: updates.email || userData.email || '',
        displayName: updates.displayName || userData.displayName || '',
        photoURL: updates.photoURL !== undefined ? updates.photoURL : userData.photoURL
      };
    }
    return userData;
  }

  // User doesn't exist in Firestore, create profile
  return createUserProfile(firebaseUser);
}

/**
 * Gets user from Firestore by ID
 */
export async function getUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const userDoc = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return userSnapshot.data() as User;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Updates user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      'metadata.lastLoginAt': serverTimestamp(),
      'metadata.lastActivityAt': serverTimestamp(),
    });
  } catch (error) {
    // Silent fail for analytics update
  }
}

/**
 * Updates user profile information
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<User> {
  try {
    const userDoc = doc(db, 'users', userId);
    
    // Remove undefined values
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    // Add updated timestamp
    cleanUpdates['metadata.updatedAt'] = serverTimestamp();
    cleanUpdates['metadata.lastActivityAt'] = serverTimestamp();

    // Update Firestore document
    await updateDoc(userDoc, cleanUpdates);

    // If display name or photo changed, update Firebase Auth profile
    const currentUser = auth.currentUser;
    if (currentUser && (updates.displayName !== undefined || updates.photoURL !== undefined)) {
      await updateProfile(currentUser, {
        displayName: updates.displayName ?? currentUser.displayName,
        photoURL: updates.photoURL ?? currentUser.photoURL,
      });
    }

    // Fetch and return updated user
    const updatedSnapshot = await getDoc(userDoc);
    return updatedSnapshot.data() as User;
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Gets user by email address
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as User;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Changes user's password
 */
export async function changeUserPassword(request: ChangePasswordRequest): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(
      user.email,
      request.currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, request.newPassword);

    // Update last activity
    await updateDoc(doc(db, 'users', user.uid), {
      'metadata.lastActivityAt': serverTimestamp(),
      'metadata.passwordChangedAt': serverTimestamp(),
    });
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Sends email verification to current user
 */
export async function sendUserEmailVerification(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found');
  }

  if (user.emailVerified) {
    throw new Error('Email is already verified');
  }

  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/login?verified=true`,
      handleCodeInApp: false,
    });
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Checks if a user has a specific permission
 */
export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * Checks if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Checks if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}