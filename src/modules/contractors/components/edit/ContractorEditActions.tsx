/**
 * Contractor Edit Actions Component
 * Form action buttons for contractor edit
 */

import { Save } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ContractorEditActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ContractorEditActions({
  isSubmitting,
  onCancel
}: ContractorEditActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Updating...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Update Contractor
          </>
        )}
      </button>
    </div>
  );
}