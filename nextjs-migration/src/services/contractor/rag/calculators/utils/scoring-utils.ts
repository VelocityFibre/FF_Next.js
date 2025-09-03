/**
 * Utility functions for scoring calculations
 */

// Generic scoring utility based on threshold array
export const applyThresholdScoring = (
  value: number, 
  thresholds: Array<{ readonly threshold: number; readonly bonus?: number; readonly penalty?: number; readonly score?: number }>,
  baseScore: number = 70
): number => {
  let score = baseScore;
  
  for (const { threshold, bonus, penalty, score: directScore } of thresholds) {
    if (directScore !== undefined && value >= threshold) {
      return directScore;
    }
    if (value >= threshold) {
      score += bonus || 0;
      break;
    }
    if (value < threshold && penalty) {
      score += penalty;
      break;
    }
  }
  
  return Math.max(Math.min(score, 100), 0);
};

// Apply fallback scoring for ranges that don't match thresholds
export const applyFallbackScoring = (
  value: number,
  thresholds: Array<{ readonly threshold: number; readonly score: number } | { readonly fallback: number }>
): number => {
  for (const item of thresholds) {
    if ('threshold' in item && value >= item.threshold) {
      return item.score;
    }
  }
  
  const fallback = thresholds.find(item => 'fallback' in item);
  return fallback ? (fallback as { readonly fallback: number }).fallback : 70;
};

// Calculate average from filtered array
export const calculateFilteredAverage = <T>(
  items: T[],
  getValue: (item: T) => number | undefined,
  defaultValue: number = 0
): number => {
  const validValues = items
    .map(getValue)
    .filter((value): value is number => value !== undefined);
  
  return validValues.length > 0 
    ? validValues.reduce((sum, value) => sum + value, 0) / validValues.length 
    : defaultValue;
};

// Calculate tenure in years from date string
export const calculateTenureInYears = (joinDate: string, referenceDate: Date = new Date()): number => {
  const join = new Date(joinDate);
  return (referenceDate.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
};

// Clamp score to valid range
export const clampScore = (score: number, min: number = 0, max: number = 100): number => {
  return Math.max(Math.min(score, max), min);
};