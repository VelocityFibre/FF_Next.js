/**
 * Error Boundary Utilities
 * Helper functions for error processing and context extraction
 */

import { ErrorInfo } from 'react';
import { ErrorDetails, ProcurementContext, ErrorLogData } from '../types/errorBoundary.types';

export const getProcurementErrorMessage = (error: Error): ErrorDetails => {
  const message = error.message?.toLowerCase() || '';
  
  // BOQ-specific errors
  if (message.includes('boq') || message.includes('bill of quantities')) {
    return {
      title: 'BOQ Processing Error',
      message: 'There was an issue processing the Bill of Quantities.',
      suggestions: [
        'Check that the BOQ file format is correct',
        'Verify all required fields are populated',
        'Ensure the BOQ is mapped to catalog items',
        'Try re-uploading the BOQ file'
      ]
    };
  }
  
  // RFQ-specific errors
  if (message.includes('rfq') || message.includes('request for quote')) {
    return {
      title: 'RFQ Processing Error',
      message: 'There was an issue with the Request for Quote.',
      suggestions: [
        'Verify supplier selections are valid',
        'Check that all RFQ items have proper specifications',
        'Ensure response deadline is in the future',
        'Try refreshing the supplier list'
      ]
    };
  }
  
  // Stock-specific errors
  if (message.includes('stock') || message.includes('inventory')) {
    return {
      title: 'Stock Management Error',
      message: 'There was an issue with inventory operations.',
      suggestions: [
        'Verify stock positions are up to date',
        'Check that movement types are valid',
        'Ensure sufficient stock is available',
        'Try refreshing the stock data'
      ]
    };
  }
  
  // Supplier-specific errors
  if (message.includes('supplier') || message.includes('vendor')) {
    return {
      title: 'Supplier Management Error',
      message: 'There was an issue with supplier operations.',
      suggestions: [
        'Verify supplier information is complete',
        'Check supplier authentication status',
        'Ensure supplier has necessary permissions',
        'Try refreshing the supplier list'
      ]
    };
  }
  
  // Generic procurement error
  return {
    title: 'Procurement System Error',
    message: 'An unexpected error occurred in the procurement module.',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Verify you have the necessary permissions',
      'Contact support if the issue persists'
    ]
  };
};

export const getProcurementContext = (): ProcurementContext | null => {
  try {
    // Extract procurement context from URL or state
    const path = window.location.pathname;
    const projectMatch = path.match(/\/projects\/([^/]+)/);
    const projectId = projectMatch ? projectMatch[1] : null;
    
    return {
      projectId,
      userId: null, // TODO: Get from auth context
      module: 'procurement',
    };
  } catch {
    return null;
  }
};

export const createErrorLogData = (
  error: Error, 
  errorInfo: ErrorInfo, 
  context?: ProcurementContext | null
): ErrorLogData => {
  return {
    module: 'procurement',
    error: {
      name: error.name,
      message: error.message,
      ...(error.stack && { stack: error.stack }),
    },
    componentStack: errorInfo.componentStack || 'No component stack available',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    projectId: context?.projectId,
    userId: context?.userId,
  };
};

export const logProcurementError = (errorData: ErrorLogData): void => {
  // Procurement-specific error logging
  console.error('Procurement Error Data:', errorData);
  
  // TODO: Integrate with actual error tracking service
  // errorTrackingService.logError(errorData);
};