/**
 * Forecasting Engine - Main Interface
 * Orchestrates predictive forecasting and mathematical models for stock errors
 */

import { StockError } from '../inventory';
import { SeasonalAnalyzer } from './seasonal-analyzer';
import { ForecastCalculator } from './forecast-calculator';
import { MonteCarloSimulator } from './monte-carlo-simulator';
import { RegressionAnalyzer } from './regression-analyzer';

/**
 * Core forecasting and predictive analysis for stock errors
 * Delegates to specialized modules for better maintainability
 */
export class ForecastingEngine {
  /**
   * Forecast future error trends
   */
  static forecastTrends(
    historicalErrors: StockError[], 
    forecastPeriod: number // days
  ): {
    expectedErrorCount: number;
    confidenceInterval: { lower: number; upper: number };
    riskFactors: string[];
    recommendations: string[];
  } {
    return ForecastCalculator.forecastTrends(historicalErrors, forecastPeriod);
  }

  /**
   * Predict seasonal variations (delegates to SeasonalAnalyzer)
   */
  static predictSeasonalVariations(
    historicalErrors: StockError[]
  ): {
    expectedPeakPeriods: Array<{ period: string; likelihood: number }>;
    seasonalFactors: Record<string, number>;
    adjustmentRecommendations: string[];
  } {
    return SeasonalAnalyzer.predictSeasonalVariations(historicalErrors);
  }

  /**
   * Generate advanced forecasting models
   */
  static generateAdvancedForecasts(
    historicalErrors: StockError[],
    forecastHorizon: number = 30
  ): {
    exponentialSmoothing: { forecast: number; trend: number; seasonal: number };
    movingAverage: { simple: number; weighted: number };
    regressionForecast: { linear: number; polynomial: number };
    confidenceMetrics: { accuracy: number; reliability: number };
  } {
    return RegressionAnalyzer.generateAdvancedForecasts(historicalErrors, forecastHorizon);
  }

  /**
   * Calculate monte carlo simulations for uncertainty modeling
   */
  static runMonteCarloSimulation(
    historicalErrors: StockError[],
    simulations: number = 1000,
    forecastDays: number = 30
  ): {
    scenarios: Array<{ probability: number; errorCount: number; scenario: string }>;
    statistics: { mean: number; median: number; stdDev: number; percentiles: Record<string, number> };
    riskAssessment: { low: number; medium: number; high: number; extreme: number };
  } {
    return MonteCarloSimulator.runSimulation(historicalErrors, simulations, forecastDays);
  }
}

// Re-export modular components for direct access
export { ForecastCalculator } from './forecast-calculator';
export { MonteCarloSimulator } from './monte-carlo-simulator';
export { RegressionAnalyzer } from './regression-analyzer';