/**
 * BOQ Viewer Header Component
 */

import { Filter, Download, Edit3, Eye, RefreshCw } from 'lucide-react';
import { BOQWithItems } from '@/types/procurement/boq.types';
import { getStatusBadge } from './BOQViewerUtils';

interface BOQViewerHeaderProps {
  boqData: BOQWithItems;
  mode: 'view' | 'edit';
  setMode: (mode: 'view' | 'edit') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onExport: () => void;
  onRefresh: () => void;
}

export default function BOQViewerHeader({
  boqData,
  mode,
  setMode,
  showFilters,
  setShowFilters,
  onExport,
  onRefresh
}: BOQViewerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {boqData.title || boqData.fileName || 'BOQ Viewer'}
        </h2>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-sm text-gray-500">
            Version {boqData.version}
          </span>
          <span className={getStatusBadge(boqData.status, 'mapping')}>
            {boqData.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm text-gray-500">
            {boqData.itemCount} items
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 border rounded-md text-sm font-medium flex items-center ${
            showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>

        <button
          onClick={onExport}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>

        <button
          onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
            mode === 'edit' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {mode === 'edit' ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              View Mode
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Mode
            </>
          )}
        </button>

        <button
          onClick={onRefresh}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
    </div>
  );
}