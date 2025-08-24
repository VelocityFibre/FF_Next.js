/**
 * Authentication Error Display Component
 * Shows authentication errors with styling
 */

import { AlertCircle } from 'lucide-react';
import { AuthErrorDisplayProps } from './LoginFormTypes';

export function AuthErrorDisplay({ error }: AuthErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
        <span className="text-red-800 text-sm">{error}</span>
      </div>
    </div>
  );
}