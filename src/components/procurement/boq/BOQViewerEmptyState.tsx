/**
 * BOQ Viewer Empty State Component
 */

import { Search } from 'lucide-react';
import { FilterState } from './BOQViewerTypes';

interface BOQViewerEmptyStateProps {
  totalItems: number;
  filters: FilterState;
  onClearFilters: () => void;
}

export default function BOQViewerEmptyState({
  totalItems,
  filters,
  onClearFilters
}: BOQViewerEmptyStateProps) {
  const hasActiveFilters = Object.values(filters).some(
    filter => filter !== '' && filter !== null
  );

  return (
    <div className="text-center py-12 bg-white rounded-lg border">
      <Search className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">No Items Found</h3>
      <p className="mt-2 text-sm text-gray-500">
        {totalItems === 0 
          ? "This BOQ doesn't contain any items yet."
          : "No items match your current filters."
        }
      </p>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}