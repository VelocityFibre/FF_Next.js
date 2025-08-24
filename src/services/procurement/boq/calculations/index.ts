// BOQ Calculations module exports
export { BOQTotalsCalculator } from './totals-calculator';
export { BOQComparisonAnalyzer } from './comparison-analyzer';
export { BOQBudgetCalculator } from './budget-calculator';

// Backward compatibility - Re-export as BOQCalculations class
export class BOQCalculations {
  // Totals and statistics
  static calculateBOQTotals = BOQTotalsCalculator.calculateBOQTotals;
  static generateCostBreakdown = BOQTotalsCalculator.generateCostBreakdown;
  static calculateCompletionPercentage = BOQTotalsCalculator.calculateCompletionPercentage;
  
  // Comparison and analysis
  static compareBOQVersions = BOQComparisonAnalyzer.compareBOQVersions;
  static analyzeVariance = BOQComparisonAnalyzer.analyzeVariance;
  
  // Budget calculations
  static calculateProjectBudget = BOQBudgetCalculator.calculateProjectBudget;
}