/**
 * Error Actions Component
 * Action buttons for error recovery and navigation
 */

import { RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorActionsProps {
  onReset: () => void;
  onReload: () => void;
  isComponentLevel: boolean;
}

export function ErrorActions({ onReset, onReload, isComponentLevel }: ErrorActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {!isComponentLevel && (
        <button
          onClick={onReload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reload Page
        </button>
      )}
      
      <button
        onClick={onReset}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Try Again
      </button>
      
      {!isComponentLevel && (
        <Link
          to="/app/procurement"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Home className="h-4 w-4" />
          Procurement Home
        </Link>
      )}
    </div>
  );
}