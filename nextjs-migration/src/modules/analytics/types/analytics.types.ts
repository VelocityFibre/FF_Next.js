/**
 * Analytics Module Type Definitions
 */

export interface DailyProgress {
  date: string;
  polesInstalled: number;
  dropsCompleted: number;
  fiberMeters: number;
  tasksCompleted: number;
  revenue: number;
}

export interface ProjectMetrics {
  projectName: string;
  completion: number;
  polesCompleted: number;
  totalPoles: number;
  dropsCompleted: number;
  totalDrops: number;
  status: 'on-track' | 'delayed' | 'ahead';
  trend: 'up' | 'down' | 'stable';
}

export interface TeamPerformance {
  teamName: string;
  productivity: number;
  tasksCompleted: number;
  avgCompletionTime: number;
  qualityScore: number;
}

export interface AnalyticsStats {
  totalPoles: number;
  totalDrops: number;
  totalFiber: number;
  totalRevenue: number;
  activeTeams: number;
}

export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';
export type MetricType = 'all' | 'poles' | 'drops' | 'fiber' | 'revenue';