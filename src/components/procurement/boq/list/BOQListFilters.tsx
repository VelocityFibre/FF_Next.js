/**
 * BOQ List Filters Component
 */

import { Search, Calendar, User } from 'lucide-react';
import { FilterState, INITIAL_FILTERS, BOQ_STATUS_LABELS, MAPPING_STATUS_LABELS } from './BOQListTypes';

interface BOQListFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  uploaders: string[];
}

export default function BOQListFilters({
  filters,
  setFilters,
  uploaders
}: BOQListFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search BOQs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Statuses</option>
          {Object.entries(BOQ_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Mapping Status */}
        <select
          value={filters.mappingStatus}
          onChange={(e) => setFilters({ ...filters, mappingStatus: e.target.value as any })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Mapping</option>
          {Object.entries(MAPPING_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Uploaded By */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filters.uploadedBy}
            onChange={(e) => setFilters({ ...filters, uploadedBy: e.target.value })}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Users</option>
            {uploaders.map(uploader => (
              <option key={uploader} value={uploader}>{uploader}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Date Range */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>

        {/* Clear Filters */}
        {Object.values(filters).some(filter => filter !== '' && filter !== 'all') && (
          <button
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}