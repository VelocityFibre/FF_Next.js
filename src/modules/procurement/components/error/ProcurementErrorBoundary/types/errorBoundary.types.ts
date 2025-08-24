/**
 * Procurement Error Boundary Types
 * Type definitions for error handling and boundary states
 */

import { ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'module' | 'component' | 'page';
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export interface ErrorDetails {
  title: string;
  message: string;
  suggestions: string[];
}

export interface ProcurementContext {
  projectId?: string | null;
  userId?: string | null;
  module: string;
}

export interface ErrorLogData {
  module: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  componentStack: string;
  timestamp: string;
  url: string;
  userAgent: string;
  projectId?: string | null;
  userId?: string | null;
}