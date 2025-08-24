/**
 * Login Form Types and Interfaces
 */

export interface LoginFormProps {
  onSuccess?: () => void;
  mode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
}

export interface LoginFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  rememberMe: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
}

export interface AuthHeaderProps {
  isSignUp: boolean;
  onModeChange?: (mode: 'login' | 'register') => void;
}

export interface LoginFieldsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  isLoading: boolean;
}

export interface RegistrationFieldsProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  isLoading: boolean;
}

export interface AuthErrorDisplayProps {
  error: string | null;
}

export interface GoogleSignInSectionProps {
  onClick: () => Promise<void>;
  loading: boolean;
  rememberMe: boolean;
}

export interface SubmitButtonProps {
  isSignUp: boolean;
  isLoading: boolean;
}