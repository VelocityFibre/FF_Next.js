import { useState } from 'react';

// Import split components
import { SOWDataViewerProps, TabType, getTabsConfig } from './viewer/SOWViewerTypes';
import { useSOWData } from './viewer/useSOWData';
import { SOWTabNavigation } from './viewer/SOWTabNavigation';
import { SOWSummaryView } from './viewer/SOWSummaryView';
import { SOWDataTable } from './viewer/SOWDataTable';
import { SOWLoadingState, SOWErrorState, SOWEmptyState } from './viewer/SOWLoadingStates';

export function SOWDataViewer({ projectId }: SOWDataViewerProps) {
  const { data, loading, error, refetch } = useSOWData(projectId);
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs = getTabsConfig(data);

  if (loading) {
    return <SOWLoadingState />;
  }

  if (error) {
    return <SOWErrorState error={error} onRetry={refetch} />;
  }

  if (!data || (!data.poles?.length && !data.drops?.length && !data.fibre?.length)) {
    return <SOWEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <SOWTabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && data.summary && (
          <SOWSummaryView summary={data.summary} />
        )}

        {activeTab === 'poles' && data.poles && (
          <SOWDataTable data={data.poles} type="poles" />
        )}

        {activeTab === 'drops' && data.drops && (
          <SOWDataTable data={data.drops} type="drops" />
        )}

        {activeTab === 'fibre' && data.fibre && (
          <SOWDataTable data={data.fibre} type="fibre" />
        )}
      </div>
    </div>
  );
}