import { cn } from '@/utils/cn';

interface ProjectTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'team', label: 'Team' },
  { id: 'documents', label: 'Documents' },
  { id: 'progress', label: 'Progress' },
];

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="flex space-x-1 p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}