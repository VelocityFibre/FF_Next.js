import { cn } from '@/utils/cn';
import { FiberSection, FilterStatus } from '../types/fiberStringing.types';

interface FiberFilterTabsProps {
  filter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  sections: FiberSection[];
}

export function FiberFilterTabs({ filter, onFilterChange, sections }: FiberFilterTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-1">
      <div className="flex space-x-1">
        {(['all', 'in_progress', 'completed', 'issues'] as const).map(status => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              filter === status
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            )}
          >
            {status === 'all' ? 'All Sections' : 
             status === 'in_progress' ? 'In Progress' :
             status === 'completed' ? 'Completed' : 'Issues'}
            {status !== 'all' && (
              <span className="ml-2 text-xs">
                ({sections.filter(s => s.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}