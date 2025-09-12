
import {
  DropsHeader,
  DropsStatsCards,
  DropsFilters,
  DropsGrid,
  useDropsManagement
} from './DropsManagement/index';

export function DropsManagement() {
  const { stats, filters, filteredDrops, updateFilters, loading, error } = useDropsManagement();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading drops data from database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading drops: {error}</p>
        <p className="text-sm text-red-600 mt-2">Using fallback data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DropsHeader stats={stats} />
      <DropsStatsCards stats={stats} />
      <DropsFilters filters={filters} onFiltersChange={updateFilters} />
      <DropsGrid drops={filteredDrops} />
    </div>
  );
}