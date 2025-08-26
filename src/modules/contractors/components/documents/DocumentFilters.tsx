/**
 * DocumentFilters Component - Advanced filtering controls for document approval queue
 * Provides comprehensive filtering options with real-time updates
 * @module DocumentFilters
 */

import { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  FileText, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { DocumentType } from '@/types/contractor.types';

interface DocumentFiltersProps {
  /**
   * Current search term
   */
  searchTerm: string;
  /**
   * Callback when search term changes
   */
  onSearchChange: (term: string) => void;
  /**
   * Current status filter
   */
  statusFilter: string;
  /**
   * Callback when status filter changes
   */
  onStatusFilterChange: (status: string) => void;
  /**
   * Current document type filter
   */
  documentTypeFilter: string;
  /**
   * Callback when document type filter changes
   */
  onDocumentTypeFilterChange: (type: string) => void;
  /**
   * Current expiry filter
   */
  expiryFilter: string;
  /**
   * Callback when expiry filter changes
   */
  onExpiryFilterChange: (expiry: string) => void;
  /**
   * Total number of documents before filtering
   */
  totalCount: number;
  /**
   * Number of documents after filtering
   */
  filteredCount: number;
  /**
   * Enable advanced filters
   */
  enableAdvancedFilters?: boolean;
  /**
   * Enable saved filter presets
   */
  enablePresets?: boolean;
  /**
   * Custom filter presets
   */
  presets?: FilterPreset[];
  /**
   * Callback when preset is selected
   */
  onPresetChange?: (preset: FilterPreset | null) => void;
}

/**
 * Filter preset configuration
 */
interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: {
    status: string;
    documentType: string;
    expiry: string;
    search?: string;
  };
  isDefault?: boolean;
}

/**
 * Document type options with labels
 */
const DOCUMENT_TYPE_OPTIONS: { value: DocumentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Document Types' },
  { value: 'tax_clearance', label: 'Tax Clearance' },
  { value: 'insurance', label: 'Insurance Certificate' },
  { value: 'company_registration', label: 'Company Registration' },
  { value: 'vat_certificate', label: 'VAT Certificate' },
  { value: 'bee_certificate', label: 'BEE Certificate' },
  { value: 'safety_certificate', label: 'Safety Certificate' },
  { value: 'technical_certification', label: 'Technical Certification' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'financial_statement', label: 'Financial Statement' },
  { value: 'reference_letter', label: 'Reference Letter' },
  { value: 'id_document', label: 'ID Document' },
  { value: 'other', label: 'Other Documents' }
];

/**
 * Default filter presets
 */
const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'pending-urgent',
    name: 'Pending & Urgent',
    description: 'Documents pending approval that are expiring soon',
    filters: {
      status: 'pending',
      documentType: 'all',
      expiry: 'expiring'
    },
    isDefault: true
  },
  {
    id: 'expired-documents',
    name: 'Expired Documents',
    description: 'All documents that have expired',
    filters: {
      status: 'all',
      documentType: 'all',
      expiry: 'expired'
    }
  },
  {
    id: 'compliance-critical',
    name: 'Compliance Critical',
    description: 'Critical compliance documents needing attention',
    filters: {
      status: 'pending',
      documentType: 'tax_clearance',
      expiry: 'all'
    }
  },
  {
    id: 'recently-rejected',
    name: 'Recently Rejected',
    description: 'Documents rejected in recent review cycles',
    filters: {
      status: 'rejected',
      documentType: 'all',
      expiry: 'all'
    }
  }
];

/**
 * DocumentFilters - Advanced filtering interface
 */
export function DocumentFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  documentTypeFilter,
  onDocumentTypeFilterChange,
  expiryFilter,
  onExpiryFilterChange,
  totalCount,
  filteredCount,
  enableAdvancedFilters = true,
  enablePresets = true,
  presets = DEFAULT_PRESETS,
  onPresetChange
}: DocumentFiltersProps) {
  // 🟢 WORKING: Component state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== '' ||
      statusFilter !== 'all' ||
      documentTypeFilter !== 'all' ||
      expiryFilter !== 'all'
    );
  }, [searchTerm, statusFilter, documentTypeFilter, expiryFilter]);

  /**
   * Get filter summary text
   */
  const getFilterSummary = useMemo(() => {
    const activeFilters: string[] = [];
    
    if (statusFilter !== 'all') {
      activeFilters.push(statusFilter.replace('_', ' '));
    }
    
    if (documentTypeFilter !== 'all') {
      const typeOption = DOCUMENT_TYPE_OPTIONS.find(opt => opt.value === documentTypeFilter);
      if (typeOption) {
        activeFilters.push(typeOption.label);
      }
    }
    
    if (expiryFilter !== 'all') {
      activeFilters.push(`${expiryFilter} documents`);
    }
    
    if (searchTerm.trim()) {
      activeFilters.push(`matching "${searchTerm}"`);
    }
    
    return activeFilters.length > 0 ? activeFilters.join(', ') : '';
  }, [statusFilter, documentTypeFilter, expiryFilter, searchTerm]);

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    onSearchChange('');
    onStatusFilterChange('all');
    onDocumentTypeFilterChange('all');
    onExpiryFilterChange('all');
    setSelectedPreset(null);
    onPresetChange?.(null);
  }, [onSearchChange, onStatusFilterChange, onDocumentTypeFilterChange, onExpiryFilterChange, onPresetChange]);

  /**
   * Apply preset filters
   */
  const applyPreset = useCallback((preset: FilterPreset) => {
    onStatusFilterChange(preset.filters.status);
    onDocumentTypeFilterChange(preset.filters.documentType);
    onExpiryFilterChange(preset.filters.expiry);
    if (preset.filters.search) {
      onSearchChange(preset.filters.search);
    }
    setSelectedPreset(preset);
    onPresetChange?.(preset);
  }, [onStatusFilterChange, onDocumentTypeFilterChange, onExpiryFilterChange, onSearchChange, onPresetChange]);

  /**
   * Handle search input with debouncing
   */
  const handleSearchChange = useCallback((value: string) => {
    onSearchChange(value);
    
    // Generate search suggestions (basic implementation)
    if (value.trim().length > 2) {
      const suggestions = [
        `${value} certificate`,
        `${value} document`,
        `${value} registration`
      ].filter(s => s.toLowerCase() !== value.toLowerCase());
      setSearchSuggestions(suggestions.slice(0, 3));
    } else {
      setSearchSuggestions([]);
    }
  }, [onSearchChange]);

  /**
   * Get status filter icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Search and Quick Filters Row */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search documents by name, type, or number..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Suggestions */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSearchChange(suggestion);
                    setIsSearchFocused(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <Search className="w-3 h-3 text-gray-400 inline mr-2" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="appearance-none pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {getStatusIcon(statusFilter)}
          </div>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Advanced Filters Toggle */}
        {enableAdvancedFilters && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                {[searchTerm && 1, statusFilter !== 'all' && 1, documentTypeFilter !== 'all' && 1, expiryFilter !== 'all' && 1]
                  .filter(Boolean).length}
              </span>
            )}
          </button>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            title="Clear all filters"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Presets */}
      {enablePresets && presets.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
          <div className="flex items-center gap-2 overflow-x-auto">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-colors ${
                  selectedPreset?.id === preset.id
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                title={preset.description}
              >
                <Tag className="w-3 h-3 mr-1" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {enableAdvancedFilters && showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <div className="relative">
              <select
                value={documentTypeFilter}
                onChange={(e) => onDocumentTypeFilterChange(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FileText className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Expiry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Status
            </label>
            <div className="relative">
              <select
                value={expiryFilter}
                onChange={(e) => onExpiryFilterChange(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">All Documents</option>
                <option value="valid">Valid Documents</option>
                <option value="expiring">Expiring Soon (30 days)</option>
                <option value="expired">Expired Documents</option>
              </select>
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Additional Filter Slot */}
          <div className="flex items-end">
            <button
              onClick={clearAllFilters}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          {filteredCount === totalCount ? (
            <span>Showing all {totalCount} documents</span>
          ) : (
            <span>
              Showing {filteredCount} of {totalCount} documents
              {getFilterSummary && (
                <span className="text-gray-500"> • {getFilterSummary}</span>
              )}
            </span>
          )}
        </div>

        {filteredCount !== totalCount && (
          <div className="text-xs text-gray-500">
            {Math.round((filteredCount / totalCount) * 100)}% of total
          </div>
        )}
      </div>
    </div>
  );
}