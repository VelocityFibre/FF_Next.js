/**
 * Authentication Hook
 * Provides user authentication state and methods
 */

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { log } from '@/lib/logger';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
  role?: string;
  permissions?: string[];
}

interface UseAuthResult {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'user', // Default role, should be fetched from user claims or database
            permissions: []
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      },
      (error) => {
        log.error('Auth state change error:', { data: error }, 'useAuth');
        setError(error.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error
  };
}