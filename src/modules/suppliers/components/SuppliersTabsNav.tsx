import { } from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { useSuppliersPortal } from '../context/SuppliersPortalContext';
import { cn } from '@/lib/utils';

// Badge component
interface BadgeProps {
  count?: number;
  type?: 'info' | 'warning' | 'error' | 'success';
  className?: string;
}

function TabBadge({ count, type = 'info', className }: BadgeProps) {
  if (!count || count === 0) return null;

  const badgeStyles = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full border min-w-[20px] h-5',
        badgeStyles[type],
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// Tab item component
interface TabItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isActive: boolean;
  isDisabled: boolean;
  badge: {
    count?: number;
    type?: 'info' | 'warning' | 'error' | 'success';
  } | undefined;
  supplier?: any;
  onClick: () => void;
}

function TabItem({
  label,
  icon: Icon,
  path,
  isActive,
  isDisabled,
  badge,
  supplier,
  onClick
}: TabItemProps) {
  const baseClasses = cn(
    'group relative flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
    'border border-transparent',
    {
      'bg-blue-600 text-white shadow-sm': isActive,
      'text-gray-600 hover:text-gray-900 hover:bg-gray-100': !isActive && !isDisabled,
      'text-gray-400 cursor-not-allowed': isDisabled,
      'cursor-pointer': !isDisabled
    }
  );

  const content = (
    <div className={baseClasses} onClick={!isDisabled ? onClick : undefined}>
      <Icon className={cn('h-4 w-4 flex-shrink-0', {
        'text-white': isActive,
        'text-gray-400': isDisabled,
        'text-gray-500 group-hover:text-gray-700': !isActive && !isDisabled
      })} />
      
      <span className="truncate">{label}</span>
      
      {badge && <TabBadge {...badge} />}

      {/* Supplier-specific indicator */}
      {supplier && !isActive && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
      )}

      {/* Active tab indicator */}
      {isActive && (
        <div className="absolute inset-x-0 -bottom-px h-0.5 bg-white rounded-full" />
      )}

      {/* Disabled overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg" />
      )}
    </div>
  );

  if (isDisabled) {
    return content;
  }

  return (
    <Link to={path} className="block">
      {content}
    </Link>
  );
}

// Main navigation component
export function SuppliersTabsNav() {
  const {
    selectedSupplier,
    activeTab,
    availableTabs,
    setActiveTab
  } = useSuppliersPortal();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        {/* Main Tabs Navigation */}
        <nav className="flex space-x-1" aria-label="Suppliers Portal Tabs">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled = tab.requiresSupplier && !selectedSupplier;

            return (
              <TabItem
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                path={tab.path}
                isActive={isActive}
                isDisabled={isDisabled}
                badge={tab.badge}
                supplier={selectedSupplier}
                onClick={() => handleTabClick(tab.id)}
              />
            );
          })}
        </nav>

        {/* Supplier Context Indicator */}
        <div className="flex items-center space-x-4 px-4 py-2">
          {selectedSupplier ? (
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Supplier Selected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <span>All Suppliers View</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Context Bar */}
      {selectedSupplier && (
        <div className="bg-gray-50 px-4 py-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Filtering by:</span>
              <span className="font-medium text-gray-900">
                {selectedSupplier.name}
              </span>
              <span className="text-gray-500">
                ({selectedSupplier.code})
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Category: {selectedSupplier.category}</span>
              <span>•</span>
              <span>Rating: {selectedSupplier.rating}/5.0</span>
              <span>•</span>
              <span>Status: {selectedSupplier.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tabs Dropdown (for responsive design) */}
      <div className="sm:hidden">
        <select 
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={activeTab}
          onChange={(e) => handleTabClick(e.target.value)}
        >
          {availableTabs.map((tab) => (
            <option 
              key={tab.id} 
              value={tab.id}
              disabled={tab.requiresSupplier && !selectedSupplier}
            >
              {tab.label}
              {tab.badge?.count ? ` (${tab.badge.count})` : ''}
              {tab.requiresSupplier && !selectedSupplier ? ' - Requires Supplier Selection' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SuppliersTabsNav;