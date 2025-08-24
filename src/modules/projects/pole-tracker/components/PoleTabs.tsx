/**
 * Pole Tabs Component
 * Tab navigation for pole detail sections
 */

import { TabConfig } from '../types/pole-detail.types';

interface PoleTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function PoleTabs({ tabs, activeTab, onTabChange }: PoleTabsProps) {
  return (
    <div className="ff-tabs-container">
      <nav className="ff-tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`ff-tab ${activeTab === tab.id ? 'ff-tab-active' : 'ff-tab-inactive'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}