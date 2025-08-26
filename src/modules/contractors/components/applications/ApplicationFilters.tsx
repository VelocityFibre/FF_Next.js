/**
 * ApplicationFilters Component - Filters for pending applications management
 * Provides filtering options for application status, date range, document status, and progress
 */

import React, { useState } from 'react';
import { Calendar, Filter, RefreshCw, Search, X } from 'lucide-react';
import { ApplicationFilters as IApplicationFilters, ApplicationStatus, RAGScore } from '@/types/contractor.types';

// 🟢 WORKING: Props interface for ApplicationFilters component
interface ApplicationFiltersProps {
  /** Current filter values */
  filters: IApplicationFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: IApplicationFilters) => void;
  /** Callback to reset all filters */
  onReset: () => void;
  /** Loading state for filter operations */
  isLoading?: boolean;
  /** Total number of applications matching current filters */
  resultsCount?: number;
}

/**
 * ApplicationFilters Component
 * Provides comprehensive filtering options for contractor applications
 */
export function ApplicationFilters({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false,
  resultsCount
}: ApplicationFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.companyName || '');

  // 🟢 WORKING: Application status options with display labels
  const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'under_review', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
    { value: 'documentation_incomplete', label: 'Documentation Incomplete', color: 'bg-red-100 text-red-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-gray-100 text-gray-800' }
  ];

  // 🟢 WORKING: RAG score options
  const ragOptions: { value: RAGScore; label: string; color: string }[] = [
    { value: 'green', label: 'Green (Low Risk)', color: 'bg-green-100 text-green-800' },
    { value: 'amber', label: 'Amber (Medium Risk)', color: 'bg-amber-100 text-amber-800' },
    { value: 'red', label: 'Red (High Risk)', color: 'bg-red-100 text-red-800' }
  ];

  // 🟢 WORKING: Document status options
  const documentStatusOptions = [
    { value: 'complete', label: 'Complete' },
    { value: 'incomplete', label: 'Incomplete' },
    { value: 'expired', label: 'Has Expired Documents' }
  ];

  // 🟢 WORKING: Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Application Date' },
    { value: 'updatedAt', label: 'Last Activity' },
    { value: 'progress', label: 'Progress' },
    { value: 'companyName', label: 'Company Name' }
  ];

  // 🟢 WORKING: Handle status filter changes
  const handleStatusChange = (status: ApplicationStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    } as IApplicationFilters);
  };

  // 🟢 WORKING: Handle RAG score filter changes
  const handleRAGScoreChange = (score: RAGScore) => {
    const currentScores = filters.ragScore || [];
    const newScores = currentScores.includes(score)
      ? currentScores.filter(s => s !== score)
      : [...currentScores, score];
    
    onFiltersChange({
      ...filters,
      ragScore: newScores.length > 0 ? newScores : undefined
    } as IApplicationFilters);
  };

  // 🟢 WORKING: Handle search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      companyName: searchTerm.trim() || undefined
    } as IApplicationFilters);
  };

  // 🟢 WORKING: Handle date range changes
  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    const date = value ? new Date(value) : undefined;
    const currentRange = filters.dateRange || {} as any;
    
    onFiltersChange({
      ...filters,
      dateRange: date ? {
        ...currentRange,
        [field]: date
      } : undefined
    });
  };

  // 🟢 WORKING: Handle progress range changes
  const handleProgressRangeChange = (field: 'min' | 'max', value: number) => {
    const currentRange = filters.progressRange || { min: 0, max: 100 };
    
    onFiltersChange({
      ...filters,
      progressRange: {
        ...currentRange,
        [field]: value
      }
    });
  };

  // 🟢 WORKING: Count active filters
  const activeFiltersCount = [
    filters.status?.length || 0,
    filters.ragScore?.length || 0,
    filters.documentStatus ? 1 : 0,
    filters.dateRange ? 1 : 0,
    filters.progressRange ? 1 : 0,
    filters.companyName ? 1 : 0
  ].reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0);

  return (
    <div className="ff-card mb-6">
      <div className="p-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Applications</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
            {resultsCount !== undefined && (
              <span className="text-sm text-gray-500">
                ({resultsCount} results)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={onReset}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <X className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  const newFilters = { ...filters };
                  delete newFilters.companyName;
                  onFiltersChange(newFilters);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Application Status Filters */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isSelected = filters.status?.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    isSelected
                      ? option.color
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            {/* RAG Score Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Assessment (RAG Score)
              </label>
              <div className="flex flex-wrap gap-2">
                {ragOptions.map((option) => {
                  const isSelected = filters.ragScore?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleRAGScoreChange(option.value)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        isSelected
                          ? option.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Status
              </label>
              <select
                value={filters.documentStatus || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  documentStatus: e.target.value as any || undefined
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Documents</option>
                {documentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Date From
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange?.startDate ? filters.dateRange.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Date To
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange?.endDate ? filters.dateRange.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Progress Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onboarding Progress Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimum Progress (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.progressRange?.min || 0}
                    onChange={(e) => handleProgressRangeChange('min', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">
                    {filters.progressRange?.min || 0}%
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Maximum Progress (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.progressRange?.max || 100}
                    onChange={(e) => handleProgressRangeChange('max', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">
                    {filters.progressRange?.max || 100}%
                  </div>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    sortBy: e.target.value as any
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    sortOrder: e.target.value as 'asc' | 'desc'
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Applying filters...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationFilters;