/**
 * Statistics Types
 * Types for tracker analytics and reporting
 */

export interface TrackerStatistics {
  totals: {
    poles: number;
    drops: number;
    fiber: number;
  };
  completed: {
    poles: number;
    drops: number;
    fiber: number;
  };
  inProgress: {
    poles: number;
    drops: number;
    fiber: number;
  };
  qualityPass: number;
  qualityFail: number;
  averageProgress: number;
  averageCompletionTime: number; // days
}