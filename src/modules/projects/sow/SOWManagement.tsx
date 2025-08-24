import { SOWHeader, SOWStats, SOWFilters, SOWTable } from './components';
import { useSOWData } from './hooks/useSOWData';

export function SOWManagement() {
  const { sows, filteredSOWs, filter, setFilter } = useSOWData();

  return (
    <div className="space-y-6">
      <SOWHeader />
      <SOWStats sows={sows} />
      <SOWFilters filter={filter} onFilterChange={setFilter} />
      <SOWTable sows={filteredSOWs} />
    </div>
  );
}