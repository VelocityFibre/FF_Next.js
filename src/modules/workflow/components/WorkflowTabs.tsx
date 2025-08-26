// 🟢 WORKING: Workflow portal tab navigation component
import React from 'react';
import { FileText, Edit3, Layers, BarChart3 } from 'lucide-react';
import type { WorkflowTabId, WorkflowTabBadge } from '../types/portal.types';

interface WorkflowTab {
  id: WorkflowTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface WorkflowTabsProps {
  activeTab: WorkflowTabId;
  onTabChange: (tabId: WorkflowTabId) => void;
  tabBadges?: Record<WorkflowTabId, WorkflowTabBadge>;
  isLoading?: boolean;
}

const tabs: WorkflowTab[] = [
  {
    id: 'templates',
    label: 'Templates',
    icon: FileText,
    description: 'View and manage workflow templates'
  },
  {
    id: 'editor',
    label: 'Editor',
    icon: Edit3,
    description: 'Create and edit workflow templates'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Layers,
    description: 'Manage project workflow assignments'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'View workflow performance metrics'
  }
];

export function WorkflowTabs({ 
  activeTab, 
  onTabChange, 
  tabBadges = {
    templates: {},
    editor: {},
    projects: {},
    analytics: {}
  },
  isLoading = false 
}: WorkflowTabsProps) {
  const renderBadge = (badge?: WorkflowTabBadge) => {
    if (!badge || (badge.count === undefined && !badge.type)) return null;

    const badgeClasses = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    };

    const className = badge.type ? badgeClasses[badge.type] : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

    return (
      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {badge.count !== undefined ? badge.count : ''}
      </span>
    );
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8" aria-label="Workflow tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = tabBadges[tab.id];
          
          return (
            <button
              key={tab.id}
              onClick={() => !isLoading && onTabChange(tab.id)}
              disabled={isLoading}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              aria-current={isActive ? 'page' : undefined}
              title={tab.description}
            >
              <IconComponent 
                className={`mr-2 h-5 w-5 transition-colors ${
                  isActive 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                }`}
                aria-hidden="true"
              />
              <span>{tab.label}</span>
              {renderBadge(badge)}
            </button>
          );
        })}
      </nav>
    </div>
  );
}