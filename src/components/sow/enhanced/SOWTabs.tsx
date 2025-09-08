/**
 * SOW Tabs Component
 */

import { Activity, MapPin, Home, Cable, Upload } from 'lucide-react';
import { cn } from '@/src/utils/cn';

export type TabType = 'summary' | 'poles' | 'drops' | 'fibre' | 'upload';

interface SOWTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  polesCount: number;
  dropsCount: number;
  fibreCount: number;
}

export function SOWTabs({ 
  activeTab, 
  onTabChange, 
  polesCount, 
  dropsCount, 
  fibreCount 
}: SOWTabsProps) {
  const tabs = [
    { id: 'summary' as TabType, label: 'Summary', icon: Activity },
    { id: 'poles' as TabType, label: `Poles (${polesCount})`, icon: MapPin },
    { id: 'drops' as TabType, label: `Drops (${dropsCount})`, icon: Home },
    { id: 'fibre' as TabType, label: `Fibre (${fibreCount})`, icon: Cable },
    { id: 'upload' as TabType, label: 'Import/Update', icon: Upload },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors",
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}