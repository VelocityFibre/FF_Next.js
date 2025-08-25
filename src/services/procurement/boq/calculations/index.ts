// BOQ Calculations module exports
import { BOQTotalsCalculator } from './totals-calculator';
import { BOQComparisonAnalyzer } from './comparison-analyzer';
import { BOQBudgetCalculator } from './budget-calculator';

// Re-export classes
export { BOQTotalsCalculator, BOQComparisonAnalyzer, BOQBudgetCalculator };

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