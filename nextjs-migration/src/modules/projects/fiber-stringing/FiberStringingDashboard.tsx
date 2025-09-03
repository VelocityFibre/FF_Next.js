import {
  FiberStringingHeader,
  FiberStatsCards,
  FiberFilterTabs,
  FiberSectionsTable,
  useFiberStringingDashboard
} from './FiberStringingDashboard/index';

export function FiberStringingDashboard() {
  const {
    sections,
    stats,
    filter,
    filteredSections,
    setFilter
  } = useFiberStringingDashboard();

  return (
    <div className="space-y-6">
      <FiberStringingHeader stats={stats} />
      <FiberStatsCards stats={stats} />
      <FiberFilterTabs 
        filter={filter}
        onFilterChange={setFilter}
        sections={sections}
      />
      <FiberSectionsTable sections={filteredSections} />
    </div>
  );
}