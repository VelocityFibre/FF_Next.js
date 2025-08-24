
import {
  DropsHeader,
  DropsStatsCards,
  DropsFilters,
  DropsGrid,
  useDropsManagement
} from './DropsManagement/index';

export function DropsManagement() {
  const { stats, filters, filteredDrops, updateFilters } = useDropsManagement();

  return (
    <div className="space-y-6">
      <DropsHeader stats={stats} />
      <DropsStatsCards stats={stats} />
      <DropsFilters filters={filters} onFiltersChange={updateFilters} />
      <DropsGrid drops={filteredDrops} />
    </div>
  );
}