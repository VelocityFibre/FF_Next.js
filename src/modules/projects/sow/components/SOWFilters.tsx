import { cn } from '@/src/utils/cn';
import { SOWFilterType } from '../types/sow.types';

interface SOWFiltersProps {
  filter: SOWFilterType;
  onFilterChange: (filter: SOWFilterType) => void;
}

export function SOWFilters({ filter, onFilterChange }: SOWFiltersProps) {
  const filters = [
    { key: 'all', label: 'All SOWs' },
    { key: 'draft', label: 'Draft' },
    { key: 'pending_approval', label: 'Pending Approval' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' }
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-1">
      <div className="flex space-x-1">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              filter === key
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}