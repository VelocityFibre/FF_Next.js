/**
 * InputMessages Component
 * Error, warning, success, and helper text messages for VelocityInput
 */

import React from 'react';

interface InputMessagesProps {
  error?: string;
  warning?: string;
  success?: string;
  helperText?: string;
  inputId?: string;
}

export const InputMessages: React.FC<InputMessagesProps> = ({
  error,
  warning,
  success,
  helperText,
  inputId,
}) => {
  const hasMessages = error || warning || success || helperText;

  if (!hasMessages) return null;

  return (
    <div className="mt-2 space-y-1">
      {/* Error message */}
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-300 animate-fadeIn flex items-center">
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Warning message */}
      {warning && !error && (
        <p id={`${inputId}-warning`} className="text-sm text-yellow-300 animate-fadeIn flex items-center">
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {warning}
        </p>
      )}

      {/* Success message */}
      {success && !error && !warning && (
        <p id={`${inputId}-success`} className="text-sm text-green-300 animate-fadeIn flex items-center">
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && !warning && !success && (
        <p id={`${inputId}-helper`} className="text-sm text-white/60">
          {helperText}
        </p>
      )}
    </div>
  );
};