export interface FiberSection {
  id: string;
  sectionName: string;
  fromPole: string;
  toPole: string;
  distance: number; // meters
  cableType: string;
  status: 'planned' | 'in_progress' | 'completed' | 'issues';
  progress: number;
  team?: string;
  startDate?: string;
  completionDate?: string;
  notes?: string;
}

export interface FiberStats {
  totalDistance: number;
  completedDistance: number;
  sectionsTotal: number;
  sectionsCompleted: number;
  sectionsInProgress: number;
  sectionsWithIssues: number;
  averageSpeed: number; // meters per day
  estimatedCompletion: string;
}

export type FilterStatus = 'all' | 'in_progress' | 'completed' | 'issues';