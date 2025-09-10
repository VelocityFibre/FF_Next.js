import { FirebaseError } from 'firebase/app';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthError } from '@/types/auth.types';

// Legacy interface for backward compatibility
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

/**
 * Maps Firebase user to legacy AuthUser format
 */
export function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

/**
 * Handles authentication errors and returns structured error object
 */
export function handleAuthError(error: unknown): AuthError {
  if (error instanceof FirebaseError) {
    const details: Record<string, unknown> = {
      originalError: error.message,
    };

    // Add specific field information based on error code
    switch (error.code) {
      case 'auth/invalid-email':
      case 'auth/user-not-found':
        details.field = 'email';
        break;
      case 'auth/wrong-password':
      case 'auth/weak-password':
        details.field = 'password';
        break;
      case 'auth/invalid-credential':
        details.field = 'credentials';
        break;
    }

    const authError: AuthError = {
      code: error.code,
      message: getReadableErrorMessage(error.code),
      details,
    };

    return authError;
  }

  // Handle non-Firebase errors
  return {
    code: 'unknown',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    details: {
      originalError: error instanceof Error ? error.message : 'Unknown error',
    },
  };
}

/**
 * Converts Firebase error codes to user-friendly messages
 */
function getReadableErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'The email address is invalid.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/cancelled-popup-request': 'Another popup is already open.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/account-exists-with-different-credential': 
      'An account already exists with the same email but different sign-in credentials.',
  };

  return errorMessages[code] || 'An error occurred during authentication.';
}