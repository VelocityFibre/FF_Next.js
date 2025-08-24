/**
 * Neon SOW Tab Navigation
 */

import { Activity, MapPin, Home, Cable } from 'lucide-react';
import { NeonTabType, SOWData } from './NeonSOWTypes';

interface NeonSOWTabsProps {
  activeTab: NeonTabType;
  onTabChange: (tab: NeonTabType) => void;
  summary: SOWData['summary'];
}

export function NeonSOWTabs({ activeTab, onTabChange, summary }: NeonSOWTabsProps) {
  const tabs = [
    { id: 'summary', label: 'Summary', icon: Activity },
    { id: 'poles', label: `Poles (${summary.totalPoles})`, icon: MapPin },
    { id: 'drops', label: `Drops (${summary.totalDrops})`, icon: Home },
    { id: 'fibre', label: `Fibre (${summary.totalFibre})`, icon: Cable },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NeonTabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
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