import React from 'react';
import { Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import {
  InstallationStatsCards,
  InstallationFilterTabs,
  InstallationsTable,
  useHomeInstallations
} from './HomeInstallationsDashboard/index';

const HomeInstallationsDashboard: React.FC = () => {
  const {
    selectedTab,
    filteredInstallations,
    stats,
    handleTabChange
  } = useHomeInstallations();

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Home Installations"
        subtitle="Manage fiber installations and customer connections"
        actions={[
          {
            label: 'Schedule Installation',
            icon: Plus as React.ComponentType<{ className?: string; }>,
            onClick: () => {},
            variant: 'primary'
          }
        ]}
      />

      <InstallationStatsCards stats={stats} />
      <InstallationFilterTabs 
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
      />
      <InstallationsTable installations={filteredInstallations} />
    </div>
  );
};

export default HomeInstallationsDashboard;