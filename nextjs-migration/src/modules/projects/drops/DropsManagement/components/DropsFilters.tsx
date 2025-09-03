
import { Search } from 'lucide-react';
import type { DropsFiltersState as DropsFilters } from '../types/drops.types';

interface DropsFiltersProps {
  filters: DropsFilters;
  onFiltersChange: (filters: Partial<DropsFilters>) => void;
}

export function DropsFilters({ filters, onFiltersChange }: DropsFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by customer, address, drop or pole number..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg"
          />
        </div>
        
        <select
          value={filters.statusFilter}
          onChange={(e) => onFiltersChange({ statusFilter: e.target.value })}
          className="px-4 py-2 border border-neutral-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>
  );
}