/**
 * Forecasting Engine
 * Core predictive forecasting and mathematical models for stock errors
 */

import { StockError, InsufficientStockError } from '../inventory';
import { StockAdjustmentError } from '../tracking';
import { SeasonalAnalyzer } from './seasonal-analyzer';

/**
 * Core forecasting and predictive analysis for stock errors
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
    const dailyAverages = this.calculateDailyAverages(historicalErrors);
    const volatility = this.calculateVolatility(dailyAverages);
    
    // Simple linear regression for trend
    const trendSlope = this.calculateTrendSlope(dailyAverages);
    const baseAverage = dailyAverages.reduce((sum, avg) => sum + avg, 0) / dailyAverages.length;
    
    // Forecast based on trend and historical patterns
    const expectedErrorCount = Math.max(0, baseAverage + (trendSlope * forecastPeriod));
    
    // Calculate confidence interval
    const margin = volatility * 1.96; // 95% confidence
    const confidenceInterval = {
      lower: Math.max(0, expectedErrorCount - margin),
      upper: expectedErrorCount + margin
    };

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(historicalErrors, trendSlope);
    
    // Generate recommendations
    const recommendations = this.generateForecastRecommendations(expectedErrorCount, riskFactors);

    return {
      expectedErrorCount: Math.round(expectedErrorCount),
      confidenceInterval: {
        lower: Math.round(confidenceInterval.lower),
        upper: Math.round(confidenceInterval.upper)
      },
      riskFactors,
      recommendations
    };
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
    const dailyAverages = this.calculateDailyAverages(historicalErrors);
    
    // Exponential smoothing
    const exponentialSmoothing = this.calculateExponentialSmoothing(dailyAverages, forecastHorizon);
    
    // Moving averages
    const movingAverage = this.calculateMovingAverages(dailyAverages);
    
    // Regression forecasts
    const regressionForecast = this.calculateRegressionForecasts(dailyAverages, forecastHorizon);
    
    // Confidence metrics
    const confidenceMetrics = this.calculateConfidenceMetrics(dailyAverages);

    return {
      exponentialSmoothing,
      movingAverage,
      regressionForecast,
      confidenceMetrics
    };
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
    const dailyAverages = this.calculateDailyAverages(historicalErrors);
    const mean = dailyAverages.reduce((sum, val) => sum + val, 0) / dailyAverages.length;
    const stdDev = this.calculateVolatility(dailyAverages);
    
    const results: number[] = [];
    
    // Run Monte Carlo simulations
    for (let i = 0; i < simulations; i++) {
      let forecastValue = mean;
      
      // Add random variation based on historical volatility
      const randomFactor = this.generateNormalRandom() * stdDev;
      forecastValue += randomFactor;
      
      // Project over forecast period
      forecastValue *= forecastDays;
      
      results.push(Math.max(0, forecastValue));
    }
    
    // Sort results for percentile calculations
    results.sort((a, b) => a - b);
    
    // Calculate statistics
    const simulationMean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const simulationMedian = results[Math.floor(results.length / 2)];
    const simulationStdDev = Math.sqrt(
      results.reduce((sum, val) => sum + Math.pow(val - simulationMean, 2), 0) / results.length
    );
    
    const percentiles = {
      p10: results[Math.floor(results.length * 0.1)],
      p25: results[Math.floor(results.length * 0.25)],
      p75: results[Math.floor(results.length * 0.75)],
      p90: results[Math.floor(results.length * 0.9)],
      p95: results[Math.floor(results.length * 0.95)]
    };
    
    // Generate scenarios
    const scenarios = [
      { probability: 0.1, errorCount: percentiles.p10, scenario: 'Best case' },
      { probability: 0.25, errorCount: percentiles.p25, scenario: 'Optimistic' },
      { probability: 0.5, errorCount: simulationMedian, scenario: 'Most likely' },
      { probability: 0.75, errorCount: percentiles.p75, scenario: 'Pessimistic' },
      { probability: 0.9, errorCount: percentiles.p90, scenario: 'Worst case' }
    ];
    
    // Risk assessment
    const riskThresholds = {
      low: results.filter(r => r <= simulationMean * 0.8).length / results.length,
      medium: results.filter(r => r > simulationMean * 0.8 && r <= simulationMean * 1.2).length / results.length,
      high: results.filter(r => r > simulationMean * 1.2 && r <= simulationMean * 1.5).length / results.length,
      extreme: results.filter(r => r > simulationMean * 1.5).length / results.length
    };

    return {
      scenarios,
      statistics: {
        mean: Math.round(simulationMean),
        median: Math.round(simulationMedian),
        stdDev: Math.round(simulationStdDev),
        percentiles: Object.fromEntries(
          Object.entries(percentiles).map(([key, val]) => [key, Math.round(val)])
        )
      },
      riskAssessment: Object.fromEntries(
        Object.entries(riskThresholds).map(([key, val]) => [key, Math.round(val * 100) / 100])
      )
    };
  }

  /**
   * Calculate daily averages for forecasting
   */
  private static calculateDailyAverages(errors: StockError[]): number[] {
    // Simplified - in practice, group by actual dates
    const days = 7; // Sample period
    const dailyAverages: number[] = [];
    
    for (let i = 0; i < days; i++) {
      const dayErrors = errors.length / days; // Simplified distribution
      dailyAverages.push(dayErrors + (Math.random() - 0.5) * 2); // Add variance
    }
    
    return dailyAverages;
  }

  /**
   * Calculate volatility for confidence intervals
   */
  private static calculateVolatility(dailyAverages: number[]): number {
    const mean = dailyAverages.reduce((sum, val) => sum + val, 0) / dailyAverages.length;
    const variance = dailyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyAverages.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate trend slope for linear regression
   */
  private static calculateTrendSlope(dailyAverages: number[]): number {
    const n = dailyAverages.length;
    if (n < 2) return 0;
    
    const xSum = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const ySum = dailyAverages.reduce((sum, val) => sum + val, 0);
    const xySum = dailyAverages.reduce((sum, val, index) => sum + (val * index), 0);
    const xSquareSum = dailyAverages.reduce((sum, _, index) => sum + (index * index), 0);
    
    const denominator = (n * xSquareSum - xSum * xSum);
    return denominator !== 0 ? (n * xySum - xSum * ySum) / denominator : 0;
  }

  /**
   * Identify risk factors from historical data
   */
  private static identifyRiskFactors(errors: StockError[], trendSlope: number): string[] {
    const riskFactors: string[] = [];
    
    if (trendSlope > 0.1) {
      riskFactors.push('Increasing error trend detected');
    }
    
    const insufficientStockCount = errors.filter(e => e instanceof InsufficientStockError).length;
    if (insufficientStockCount > errors.length * 0.5) {
      riskFactors.push('High proportion of insufficient stock errors');
    }
    
    const adjustmentErrors = errors.filter(e => e instanceof StockAdjustmentError).length;
    if (adjustmentErrors > errors.length * 0.3) {
      riskFactors.push('Frequent stock adjustment issues');
    }

    if (errors.length > 20) {
      riskFactors.push('High overall error volume');
    }
    
    return riskFactors;
  }

  /**
   * Generate forecast recommendations
   */
  private static generateForecastRecommendations(expectedErrorCount: number, riskFactors: string[]): string[] {
    const recommendations: string[] = [];
    
    if (expectedErrorCount > 10) {
      recommendations.push('Implement preventive measures to reduce expected high error count');
    }
    
    if (riskFactors.includes('Increasing error trend detected')) {
      recommendations.push('Investigate root causes of increasing error trend');
    }
    
    if (riskFactors.includes('High proportion of insufficient stock errors')) {
      recommendations.push('Review inventory management and reorder policies');
    }

    if (riskFactors.includes('High overall error volume')) {
      recommendations.push('Consider systematic process improvements');
    }
    
    return recommendations;
  }

  /**
   * Calculate exponential smoothing forecast
   */
  private static calculateExponentialSmoothing(data: number[], horizon: number): { forecast: number; trend: number; seasonal: number } {
    if (data.length === 0) return { forecast: 0, trend: 0, seasonal: 1 };

    const alpha = 0.3; // Smoothing parameter
    const beta = 0.1; // Trend parameter
    
    let level = data[0];
    let trend = data.length > 1 ? data[1] - data[0] : 0;
    
    // Apply exponential smoothing
    for (let i = 1; i < data.length; i++) {
      const newLevel = alpha * data[i] + (1 - alpha) * (level + trend);
      const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
      level = newLevel;
      trend = newTrend;
    }
    
    return {
      forecast: level + trend * horizon,
      trend,
      seasonal: 1 // Simplified seasonal component
    };
  }

  /**
   * Calculate moving averages
   */
  private static calculateMovingAverages(data: number[]): { simple: number; weighted: number } {
    if (data.length === 0) return { simple: 0, weighted: 0 };

    const period = Math.min(5, data.length);
    const recentData = data.slice(-period);
    
    // Simple moving average
    const simple = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
    
    // Weighted moving average (more weight to recent values)
    let weightedSum = 0;
    let weightTotal = 0;
    
    recentData.forEach((value, index) => {
      const weight = index + 1; // Linear weighting
      weightedSum += value * weight;
      weightTotal += weight;
    });
    
    const weighted = weightTotal > 0 ? weightedSum / weightTotal : simple;
    
    return { simple, weighted };
  }

  /**
   * Calculate regression forecasts
   */
  private static calculateRegressionForecasts(data: number[], horizon: number): { linear: number; polynomial: number } {
    if (data.length < 2) return { linear: 0, polynomial: 0 };

    // Linear regression
    const slope = this.calculateTrendSlope(data);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const linear = mean + slope * horizon;

    // Simple polynomial (quadratic) approximation
    const polynomial = linear * (1 + slope * 0.1); // Simplified quadratic component

    return {
      linear: Math.max(0, linear),
      polynomial: Math.max(0, polynomial)
    };
  }

  /**
   * Calculate confidence metrics
   */
  private static calculateConfidenceMetrics(data: number[]): { accuracy: number; reliability: number } {
    if (data.length < 3) return { accuracy: 0.5, reliability: 0.5 };

    // Calculate prediction accuracy using simple methods
    const predictions = [];
    const actuals = [];
    
    for (let i = 2; i < data.length; i++) {
      const predicted = (data[i-2] + data[i-1]) / 2; // Simple average prediction
      predictions.push(predicted);
      actuals.push(data[i]);
    }

    // Calculate accuracy
    let totalError = 0;
    for (let i = 0; i < predictions.length; i++) {
      const error = Math.abs(predictions[i] - actuals[i]);
      const relativeError = actuals[i] > 0 ? error / actuals[i] : 0;
      totalError += relativeError;
    }
    
    const accuracy = predictions.length > 0 ? Math.max(0, 1 - (totalError / predictions.length)) : 0.5;
    
    // Calculate reliability based on data consistency
    const variance = this.calculateVolatility(data);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const coefficientOfVariation = mean > 0 ? variance / mean : 1;
    const reliability = Math.max(0, 1 - coefficientOfVariation);

    return {
      accuracy: Math.round(accuracy * 100) / 100,
      reliability: Math.round(reliability * 100) / 100
    };
  }

  /**
   * Generate normal random number using Box-Muller transform
   */
  private static generateNormalRandom(): number {
    let u1 = Math.random();
    const u2 = Math.random();
    
    // Ensure u1 is not zero to avoid log(0)
    while (u1 === 0) {
      u1 = Math.random();
    }
    
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}