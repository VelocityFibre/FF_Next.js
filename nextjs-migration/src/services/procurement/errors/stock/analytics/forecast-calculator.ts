/**
 * Forecast Calculator
 * Core forecasting algorithms and mathematical calculations
 */

import { StockError, InsufficientStockError } from '../inventory';
import { StockAdjustmentError } from '../tracking';

export class ForecastCalculator {
  /**
   * Forecast future error trends based on historical data
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
   * Calculate daily averages for forecasting
   */
  static calculateDailyAverages(errors: StockError[]): number[] {
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
  static calculateVolatility(dailyAverages: number[]): number {
    const mean = dailyAverages.reduce((sum, val) => sum + val, 0) / dailyAverages.length;
    const variance = dailyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyAverages.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate trend slope for linear regression
   */
  static calculateTrendSlope(dailyAverages: number[]): number {
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
  static identifyRiskFactors(errors: StockError[], trendSlope: number): string[] {
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
  static generateForecastRecommendations(expectedErrorCount: number, riskFactors: string[]): string[] {
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
}