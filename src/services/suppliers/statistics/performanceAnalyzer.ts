/**
 * Performance Analyzer - Backward Compatibility Layer
 * @deprecated Use ./performance/index.ts for improved modular performance analysis
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular performance analysis system in ./performance/
 */

// Re-export everything from the new modular structure
export * from './performance';

// Import classes for backward compatibility
import { PerformanceAnalysisEngine } from './performance/analyzer-engine';
import { PerformanceReportsGenerator } from './performance/performance-reports';

/**
 * Legacy PerformanceAnalyzer class for backward compatibility
 */
export class PerformanceAnalyzer {
  /**
   * Get performance trends over time
   * @deprecated Use PerformanceAnalysisEngine.generatePerformanceTrends instead
   */
  static async getPerformanceTrends(months: number = 12) {
    return PerformanceAnalysisEngine.generatePerformanceTrends(months);
  }

  /**
   * Get performance benchmarks
   * @deprecated Use PerformanceAnalysisEngine.generatePerformanceBenchmarks instead
   */
  static async getPerformanceBenchmarks() {
    return PerformanceAnalysisEngine.generatePerformanceBenchmarks();
  }

  /**
   * Analyze trends
   * @deprecated Use PerformanceAnalysisEngine.analyzeTrends instead
   */
  static async analyzeTrends() {
    return PerformanceAnalysisEngine.analyzeTrends();
  }
}