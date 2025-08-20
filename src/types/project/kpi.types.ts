/**
 * KPI and metrics types for projects
 */

export interface ProjectKPITargets {
  productivity?: KPITarget;
  quality?: KPITarget;
  safety?: KPITarget;
  cost?: KPITarget;
  schedule?: KPITarget;
  customer?: KPITarget;
  custom?: KPITarget[];
}

export interface KPITarget {
  name: string;
  description?: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  threshold?: {
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
  };
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: Date | string;
  history?: KPIDataPoint[];
  responsible?: string;
  notes?: string;
}

export interface KPIDataPoint {
  date: Date | string;
  value: number;
  notes?: string;
}

export interface ProjectPerformance {
  schedulePerformance?: number; // SPI
  costPerformance?: number; // CPI
  qualityScore?: number;
  safetyScore?: number;
  customerSatisfaction?: number;
  teamProductivity?: number;
  riskScore?: number;
  overallHealth?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  totalHours: number;
  actualHours: number;
  budgetUtilization: number;
  resourceUtilization: number;
  defectRate?: number;
  reworkRate?: number;
  changeRequests?: number;
  issuesResolved?: number;
  averageTaskDuration?: number;
  velocityTrend?: number[];
}

export const DEFAULT_KPI_CONFIGURATIONS: { [key: string]: Partial<KPITarget> } = {
  productivity: {
    name: 'Productivity',
    metric: 'Tasks Completed per Day',
    unit: 'tasks/day',
    frequency: 'daily',
    threshold: {
      min: 5,
      warning: 8,
      target: 10
    }
  },
  quality: {
    name: 'Quality Score',
    metric: 'Defect Rate',
    unit: '%',
    frequency: 'weekly',
    threshold: {
      max: 5,
      warning: 3,
      target: 1
    }
  },
  safety: {
    name: 'Safety Incidents',
    metric: 'Incidents per Month',
    unit: 'incidents',
    frequency: 'monthly',
    threshold: {
      max: 1,
      warning: 0,
      target: 0
    }
  },
  cost: {
    name: 'Cost Performance',
    metric: 'CPI',
    unit: 'index',
    frequency: 'weekly',
    threshold: {
      min: 0.9,
      warning: 0.95,
      target: 1.0
    }
  },
  schedule: {
    name: 'Schedule Performance',
    metric: 'SPI',
    unit: 'index',
    frequency: 'weekly',
    threshold: {
      min: 0.9,
      warning: 0.95,
      target: 1.0
    }
  },
  customer: {
    name: 'Customer Satisfaction',
    metric: 'CSAT Score',
    unit: '%',
    frequency: 'monthly',
    threshold: {
      min: 70,
      warning: 80,
      target: 90
    }
  }
};