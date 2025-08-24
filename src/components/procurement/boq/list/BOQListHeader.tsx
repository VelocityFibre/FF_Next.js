/**
 * BOQ List Header Component
 */

import { Plus, Filter, RefreshCw, Upload } from 'lucide-react';

interface BOQListHeaderProps {
  totalBOQs: number;
  filteredCount: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onCreateBOQ?: (() => void) | undefined;
  onUploadBOQ?: (() => void) | undefined;
  onRefresh: () => void;
}

export default function BOQListHeader({
  totalBOQs,
  filteredCount,
  showFilters,
  setShowFilters,
  onCreateBOQ,
  onUploadBOQ,
  onRefresh
}: BOQListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Bill of Quantities</h2>
        <p className="text-sm text-gray-500 mt-1">
          {filteredCount === totalBOQs 
            ? `${totalBOQs} BOQs` 
            : `${filteredCount} of ${totalBOQs} BOQs`
          }
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 border rounded-md text-sm font-medium flex items-center ${
            showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>

        <button
          onClick={onRefresh}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>

        {onUploadBOQ && (
          <button
            onClick={onUploadBOQ}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload BOQ
          </button>
        )}

        {onCreateBOQ && (
          <button
            onClick={onCreateBOQ}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create BOQ
          </button>
        )}
      </div>
    </div>
  );
}