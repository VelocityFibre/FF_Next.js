/**
 * Stock Error Analytics - Modular Export
 * Barrel export with backward compatibility for stock error analytics
 */

// Type definitions
export * from './analytics-types';

// Core modules
export { ErrorTracker } from './error-tracker';
export { AnalyticsEngine } from './analytics-engine';
export { TrendAnalyzer } from './trend-analyzer';
export { PatternAnalyzer } from './pattern-analyzer';
export { ForecastingEngine } from './forecasting-engine';
export { MetricsCalculator } from './metrics-calculator';
export { RiskForecaster } from './risk-forecaster';

// Legacy compatibility - Re-export main analytics class
import { ErrorTracker } from './error-tracker';
import { AnalyticsEngine } from './analytics-engine';
import { TrendAnalyzer } from './trend-analyzer';
import { PatternAnalyzer } from './pattern-analyzer';
import { ForecastingEngine } from './forecasting-engine';
import { MetricsCalculator } from './metrics-calculator';
import { RiskForecaster } from './risk-forecaster';
import { StockError } from '../inventory';
import { 
  ErrorPattern, 
  ErrorInsight, 
  ErrorMetrics,
  ErrorTrend,
  PredictiveInsights,
  TimeframeConfig
} from './analytics-types';

/**
 * @deprecated Use individual modules (ErrorTracker, AnalyticsEngine, TrendAnalyzer) instead
 * Maintained for backward compatibility only
 */
export class StockErrorAnalytics {
  /**
   * @deprecated Use ErrorTracker.analyzeErrorPattern() instead
   */
  static analyzeErrorPattern(errors: StockError[]) {
    return ErrorTracker.analyzeErrorPattern(errors);
  }

  /**
   * @deprecated Use PatternAnalyzer.identifyErrorPatterns() instead
   */
  static identifyErrorPatterns(errors: StockError[]): ErrorPattern[] {
    return PatternAnalyzer.identifyErrorPatterns(errors);
  }

  /**
   * @deprecated Use PatternAnalyzer.generateErrorInsights() instead
   */
  static generateErrorInsights(errors: StockError[]): ErrorInsight[] {
    return PatternAnalyzer.generateErrorInsights(errors);
  }

  /**
   * @deprecated Use MetricsCalculator.calculateErrorMetrics() instead
   */
  static calculateErrorMetrics(errors: StockError[], timeframe: TimeframeConfig): ErrorMetrics {
    return MetricsCalculator.calculateErrorMetrics(errors, timeframe);
  }

  /**
   * @deprecated Use AnalyticsEngine.generatePredictiveInsights() instead
   */
  static generatePredictiveInsights(errors: StockError[]): PredictiveInsights {
    return AnalyticsEngine.generatePredictiveInsights(errors);
  }

  /**
   * New method: Analyze trends (delegates to TrendAnalyzer)
   */
  static analyzeTrends(
    errors: StockError[], 
    timeframe: TimeframeConfig,
    resolution: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'
  ) {
    return TrendAnalyzer.analyzeTrends(errors, timeframe, resolution);
  }

  /**
   * Detect anomalies in error patterns (delegates to TrendAnalyzer)
   */
  static detectAnomalies(trends: ErrorTrend[], threshold?: number) {
    return TrendAnalyzer.detectAnomalies(trends, threshold);
  }

  /**
   * Analyze trend velocity (delegates to TrendAnalyzer)
   */
  static analyzeTrendVelocity(trends: ErrorTrend[]) {
    return TrendAnalyzer.analyzeTrendVelocity(trends);
  }

  /**
   * New method: Compare periods (delegates to TrendAnalyzer)
   */
  static comparePeriods(
    period1Errors: StockError[],
    period2Errors: StockError[],
    period1Label?: string,
    period2Label?: string
  ) {
    return TrendAnalyzer.comparePeriods(period1Errors, period2Errors, period1Label, period2Label);
  }

  /**
   * New method: Forecast trends (delegates to ForecastingEngine)
   */
  static forecastErrorTrends(historicalErrors: StockError[], forecastPeriod: number) {
    return ForecastingEngine.forecastTrends(historicalErrors, forecastPeriod);
  }

  /**
   * New method: Predict seasonal variations (delegates to ForecastingEngine)
   */
  static predictSeasonalVariations(historicalErrors: StockError[]) {
    return ForecastingEngine.predictSeasonalVariations(historicalErrors);
  }

  /**
   * Forecast trends (delegates to ForecastingEngine)
   */
  static forecastTrends(historicalErrors: StockError[], forecastPeriod: number) {
    return ForecastingEngine.forecastTrends(historicalErrors, forecastPeriod);
  }

  /**
   * New method: Analyze item patterns (delegates to PatternAnalyzer)
   */
  static analyzeItemPatterns(errors: StockError[]) {
    return PatternAnalyzer.analyzeItemPatterns(errors);
  }

  /**
   * New method: Analyze location patterns (delegates to PatternAnalyzer)
   */
  static analyzeLocationPatterns(errors: StockError[]) {
    return PatternAnalyzer.analyzeLocationPatterns(errors);
  }

  /**
   * New method: Calculate advanced metrics (delegates to MetricsCalculator)
   */
  static calculateAdvancedMetrics(errors: StockError[]) {
    return MetricsCalculator.calculateAdvancedMetrics(errors);
  }

  /**
   * New method: Generate benchmarks (delegates to MetricsCalculator)
   */
  static generateBenchmarks(errors: StockError[], timeframe: TimeframeConfig) {
    return MetricsCalculator.generateBenchmarks(errors, timeframe);
  }

  /**
   * New method: Forecast item risks (delegates to RiskForecaster)
   */
  static forecastItemRisksDetailed(historicalErrors: StockError[], targetItems: string[]) {
    return RiskForecaster.forecastItemRisks(historicalErrors, targetItems);
  }

  /**
   * New method: Forecast location risks (delegates to RiskForecaster)
   */
  static forecastLocationRisks(historicalErrors: StockError[], targetLocations: string[]) {
    return RiskForecaster.forecastLocationRisks(historicalErrors, targetLocations);
  }

  /**
   * New method: Analyze risk patterns (delegates to RiskForecaster)
   */
  static analyzeRiskPatterns(historicalErrors: StockError[]) {
    return RiskForecaster.analyzeRiskPatterns(historicalErrors);
  }
}

// Default export for backward compatibility
export default StockErrorAnalytics;