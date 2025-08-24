import { useState, FormEvent } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
  type: 'select' | 'checkbox' | 'radio' | 'date' | 'daterange';
  options?: { label: string; value: string }[];
}

interface StandardSearchFilterProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  filterOptions?: FilterOption[];
  searchValue?: string;
  showFilters?: boolean;
}

export function StandardSearchFilter({
  placeholder = 'Search...',
  onSearch,
  onFilter,
  filterOptions = [],
  searchValue: initialSearchValue = '',
  showFilters = true
}: StandardSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchValue);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    if (onFilter) {
      onFilter({});
    }
    setShowFilterPanel(false);
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key] !== '' && activeFilters[key] !== undefined
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
        
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {showFilterPanel && filterOptions.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filter Options</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filterOptions.map((filter) => (
              <div key={filter.value} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <select
                    value={activeFilters[filter.value] || ''}
                    onChange={(e) => handleFilterChange(filter.value, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={activeFilters[filter.value] || ''}
                    onChange={(e) => handleFilterChange(filter.value, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                )}
                
                {filter.type === 'checkbox' && (
                  <div className="space-y-2">
                    {filter.options?.map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeFilters[filter.value]?.includes(option.value) || false}
                          onChange={(e) => {
                            const current = activeFilters[filter.value] || [];
                            const newValue = e.target.checked
                              ? [...current, option.value]
                              : current.filter((v: string) => v !== option.value);
                            handleFilterChange(filter.value, newValue);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}