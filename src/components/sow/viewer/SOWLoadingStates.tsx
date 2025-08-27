/**
 * SOW Data Viewer Loading and Error States
 */

import { Loader2, RefreshCw, AlertCircle, MapPin } from 'lucide-react';

export function SOWLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
      <p className="text-[var(--ff-text-secondary)]">Loading SOW data from Neon...</p>
    </div>
  );
}

interface SOWErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function SOWErrorState({ error, onRetry }: SOWErrorStateProps) {
  return (
    <div className="bg-error-50 border border-error-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-error-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-error-900">Failed to load SOW data</h3>
          <p className="text-sm text-error-700 mt-1">{error}</p>
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-error-600 hover:text-error-700 hover:bg-error-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export function SOWEmptyState() {
  return (
    <div className="text-center py-12">
      <MapPin className="w-12 h-12 text-[var(--ff-text-tertiary)] mx-auto mb-4" />
      <h3 className="text-lg font-medium text-[var(--ff-text-primary)] mb-2">No SOW Data</h3>
      <p className="text-[var(--ff-text-secondary)]">
        No Scope of Work data has been uploaded for this project yet.
      </p>
    </div>
  );
}