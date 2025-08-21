import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthUser } from '@/services/authService';
import {
  User,
  UserRole,
  Permission,
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
  ChangePasswordRequest,
} from '@/types/auth.types';

interface AuthContextType {
  // Legacy properties for backward compatibility
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Enhanced properties with RBAC
  currentUser: User | null;
  isAuthenticated: boolean;
  signInWithEmailEnhanced: (credentials: LoginCredentials) => Promise<void>;
  signInWithGoogleEnhanced: (rememberMe?: boolean) => Promise<void>;
  registerWithEmail: (credentials: RegisterCredentials) => Promise<void>;
  resetPasswordEnhanced: (request: PasswordResetRequest) => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // Permission checking methods
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  
  // Utility methods
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Legacy state for backward compatibility
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced state with RBAC
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Set up enhanced auth state listener
    const unsubscribeEnhanced = authService.onAuthStateChangedEnhanced((user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    // Set up legacy auth state listener for backward compatibility
    const unsubscribeLegacy = authService.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => {
      unsubscribeEnhanced();
      unsubscribeLegacy();
    };
  }, []);

  // Legacy methods for backward compatibility
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const user = await authService.signInWithEmail(email, password);
      setUser(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const user = await authService.signInWithGoogle();
      setUser(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      const user = await authService.signUp(email, password, displayName);
      setUser(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send password reset email';
      setError(message);
      throw err;
    }
  };

  // Enhanced methods with RBAC
  const signInWithEmailEnhanced = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const user = await authService.signInWithEmailEnhanced(credentials);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    }
  };

  const signInWithGoogleEnhanced = async (rememberMe = false) => {
    try {
      setError(null);
      const user = await authService.signInWithGoogleEnhanced(rememberMe);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(message);
      throw err;
    }
  };

  const registerWithEmail = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      const user = await authService.registerWithEmail(credentials);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      setError(message);
      throw err;
    }
  };

  const resetPasswordEnhanced = async (request: PasswordResetRequest) => {
    try {
      setError(null);
      await authService.resetPasswordEnhanced(request);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send password reset email';
      setError(message);
      throw err;
    }
  };

  const changePassword = async (request: ChangePasswordRequest) => {
    try {
      setError(null);
      await authService.changePassword(request.currentPassword, request.newPassword);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setError(message);
      throw err;
    }
  };

  const sendEmailVerification = async () => {
    try {
      setError(null);
      await authService.sendEmailVerification();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email';
      setError(message);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setError(null);
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      const profileUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName) profileUpdates.displayName = updates.displayName;
      if (updates.photoURL) profileUpdates.photoURL = updates.photoURL;
      await authService.updateUserProfile(profileUpdates);
      // Refresh user data
      await refreshUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw err;
    }
  };

  // Permission checking methods
  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return authService.hasPermission(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!currentUser) return false;
    return authService.hasAnyPermission(permissions);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!currentUser) return false;
    return authService.hasAllPermissions(permissions);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!currentUser) return false;
    return authService.hasRole(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return currentUser?.role ? roles.includes(currentUser.role as UserRole) : false;
  };

  // Utility methods
  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUserEnhanced();
      setCurrentUser(user);
      setIsAuthenticated(!!user);
    } catch (err) {
      console.error('Error refreshing user:', err);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    // Legacy properties for backward compatibility
    user,
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    
    // Enhanced properties with RBAC
    currentUser,
    isAuthenticated,
    signInWithEmailEnhanced,
    signInWithGoogleEnhanced,
    registerWithEmail,
    resetPasswordEnhanced,
    changePassword,
    sendEmailVerification,
    updateProfile,
    
    // Permission checking methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    
    // Utility methods
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}