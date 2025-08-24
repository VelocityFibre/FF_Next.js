import type { NeonPole } from '../../../pole-tracker/services/poleTrackerNeonService';

export interface PoleFilters {
  searchTerm: string;
  selectedStatus: string;
  selectedPhase: string;
}

export type ViewMode = 'grid' | 'list';

export interface PoleTrackerListProps {
  poles?: NeonPole[];
  isLoading?: boolean;
  error?: Error | null;
}