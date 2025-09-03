/**
 * Risk Forecaster
 * Risk assessment and forecasting for specific items and locations
 */

import { StockError, InsufficientStockError } from '../inventory';
import { StockAdjustmentError } from '../tracking';

/**
 * Risk assessment and forecasting functionality
 */
export class RiskForecaster {
  /**
   * Generate risk forecasts for specific items
   */
  static forecastItemRisks(
    historicalErrors: StockError[],
    targetItems: string[]
  ): Array<{
    itemCode: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    expectedErrors: number;
    primaryRiskFactors: string[];
    mitigationStrategies: string[];
  }> {
    return targetItems.map(itemCode => {
      const itemErrors = historicalErrors.filter(error => 
        'itemCode' in error && error.itemCode === itemCode
      );

      const riskLevel = this.calculateItemRiskLevel(itemErrors);
      const expectedErrors = this.calculateExpectedErrors(itemErrors);
      const primaryRiskFactors = this.identifyItemRiskFactors(itemErrors);
      const mitigationStrategies = this.generateMitigationStrategies(itemCode, riskLevel, primaryRiskFactors);

      return {
        itemCode,
        riskLevel,
        expectedErrors,
        primaryRiskFactors,
        mitigationStrategies
      };
    });
  }

  /**
   * Generate location-based forecasts
   */
  static forecastLocationRisks(
    historicalErrors: StockError[],
    targetLocations: string[]
  ): Array<{
    location: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    expectedErrors: number;
    primaryIssues: string[];
    improvementActions: string[];
  }> {
    return targetLocations.map(location => {
      const locationErrors = historicalErrors.filter(error => {
        const errorLocation = this.extractErrorLocation(error);
        return errorLocation === location;
      });

      const riskLevel = this.calculateLocationRiskLevel(locationErrors);
      const expectedErrors = this.calculateExpectedErrors(locationErrors);
      const primaryIssues = this.identifyLocationIssues(locationErrors);
      const improvementActions = this.generateLocationImprovements(location, riskLevel, primaryIssues);

      return {
        location,
        riskLevel,
        expectedErrors,
        primaryIssues,
        improvementActions
      };
    });
  }

  /**
   * Analyze risk patterns across error types
   */
  static analyzeRiskPatterns(
    historicalErrors: StockError[]
  ): {
    highRiskItems: Array<{ itemCode: string; riskScore: number; reasons: string[] }>;
    highRiskLocations: Array<{ location: string; riskScore: number; reasons: string[] }>;
    riskTrends: Array<{ period: string; riskLevel: number; contributors: string[] }>;
    emergingRisks: Array<{ risk: string; likelihood: number; impact: string }>;
  } {
    const highRiskItems = this.identifyHighRiskItems(historicalErrors);
    const highRiskLocations = this.identifyHighRiskLocations(historicalErrors);
    const riskTrends = this.calculateRiskTrends(historicalErrors);
    const emergingRisks = this.identifyEmergingRisks(historicalErrors);

    return {
      highRiskItems,
      highRiskLocations,
      riskTrends,
      emergingRisks
    };
  }

  /**
   * Calculate item-specific risk levels
   */
  private static calculateItemRiskLevel(itemErrors: StockError[]): 'low' | 'medium' | 'high' | 'critical' {
    if (itemErrors.length === 0) return 'low';
    if (itemErrors.length >= 10) return 'critical';
    if (itemErrors.length >= 5) return 'high';
    if (itemErrors.length >= 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate location-specific risk levels
   */
  private static calculateLocationRiskLevel(locationErrors: StockError[]): 'low' | 'medium' | 'high' | 'critical' {
    if (locationErrors.length === 0) return 'low';
    if (locationErrors.length >= 15) return 'critical';
    if (locationErrors.length >= 8) return 'high';
    if (locationErrors.length >= 3) return 'medium';
    return 'low';
  }

  /**
   * Calculate expected errors for forecasting
   */
  private static calculateExpectedErrors(errors: StockError[]): number {
    // Simple average-based forecasting
    const recentErrorRate = errors.length / 30; // Assume 30-day period
    return Math.round(recentErrorRate * 30); // Forecast for next 30 days
  }

  /**
   * Identify item-specific risk factors
   */
  private static identifyItemRiskFactors(itemErrors: StockError[]): string[] {
    const factors: string[] = [];
    
    const insufficientStock = itemErrors.filter(e => e instanceof InsufficientStockError).length;
    if (insufficientStock > itemErrors.length * 0.7) {
      factors.push('Frequent stock shortages');
    }

    if (itemErrors.length > 5) {
      factors.push('High error frequency');
    }

    const adjustmentErrors = itemErrors.filter(e => e instanceof StockAdjustmentError).length;
    if (adjustmentErrors > itemErrors.length * 0.3) {
      factors.push('Frequent stock adjustments');
    }

    return factors;
  }

  /**
   * Identify location-specific issues
   */
  private static identifyLocationIssues(locationErrors: StockError[]): string[] {
    const issues: string[] = [];
    
    if (locationErrors.length > 5) {
      issues.push('High error frequency at this location');
    }
    
    const errorTypes = new Set(locationErrors.map(e => e.constructor.name));
    if (errorTypes.size > 2) {
      issues.push('Multiple error types occurring');
    }

    const recentErrors = locationErrors.slice(-5); // Last 5 errors
    if (recentErrors.length === 5) {
      issues.push('Consistent recent error activity');
    }

    return issues;
  }

  /**
   * Generate mitigation strategies for items
   */
  private static generateMitigationStrategies(itemCode: string, riskLevel: string, riskFactors: string[]): string[] {
    const strategies: string[] = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      strategies.push(`Implement automated reorder points for ${itemCode}`);
      strategies.push(`Increase safety stock levels for ${itemCode}`);
    }
    
    if (riskFactors.includes('Frequent stock shortages')) {
      strategies.push('Review demand forecasting accuracy');
      strategies.push('Consider alternative suppliers');
    }

    if (riskFactors.includes('High error frequency')) {
      strategies.push('Implement daily monitoring and alerts');
      strategies.push('Assign dedicated staff for oversight');
    }

    return strategies;
  }

  /**
   * Generate location improvement actions
   */
  private static generateLocationImprovements(location: string, riskLevel: string, issues: string[]): string[] {
    const actions: string[] = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      actions.push(`Conduct comprehensive audit at ${location}`);
      actions.push(`Review staff training at ${location}`);
    }
    
    if (issues.includes('Multiple error types occurring')) {
      actions.push('Analyze root causes of diverse error patterns');
      actions.push('Implement standardized processes');
    }

    if (issues.includes('High error frequency at this location')) {
      actions.push('Increase quality control measures');
      actions.push('Review equipment and infrastructure');
    }

    return actions;
  }

  /**
   * Identify high-risk items
   */
  private static identifyHighRiskItems(errors: StockError[]): Array<{ itemCode: string; riskScore: number; reasons: string[] }> {
    const itemScores = new Map<string, { count: number; types: Set<string> }>();
    
    errors.forEach(error => {
      if ('itemCode' in error && error.itemCode && typeof error.itemCode === 'string') {
        const itemCode = error.itemCode as string;
        const current = itemScores.get(itemCode) || { count: 0, types: new Set() };
        current.count++;
        current.types.add(error.constructor.name);
        itemScores.set(itemCode, current);
      }
    });

    return Array.from(itemScores.entries())
      .map(([itemCode, data]) => {
        let riskScore = data.count * 10; // Base score
        riskScore += data.types.size * 5; // Bonus for multiple error types
        
        const reasons = [];
        if (data.count > 5) reasons.push('High error frequency');
        if (data.types.has('InsufficientStockError')) reasons.push('Stock shortage issues');
        if (data.types.size > 2) reasons.push('Multiple error types');

        return { itemCode, riskScore, reasons };
      })
      .filter(item => item.riskScore > 20)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }

  /**
   * Identify high-risk locations
   */
  private static identifyHighRiskLocations(errors: StockError[]): Array<{ location: string; riskScore: number; reasons: string[] }> {
    const locationScores = new Map<string, { count: number; types: Set<string> }>();
    
    errors.forEach(error => {
      const location = this.extractErrorLocation(error);
      if (location) {
        const current = locationScores.get(location) || { count: 0, types: new Set() };
        current.count++;
        current.types.add(error.constructor.name);
        locationScores.set(location, current);
      }
    });

    return Array.from(locationScores.entries())
      .map(([location, data]) => {
        let riskScore = data.count * 15; // Base score (higher than items)
        riskScore += data.types.size * 8; // Bonus for multiple error types
        
        const reasons = [];
        if (data.count > 8) reasons.push('Very high error frequency');
        if (data.types.size > 2) reasons.push('Diverse error patterns');
        
        return { location, riskScore, reasons };
      })
      .filter(loc => loc.riskScore > 30)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }

  /**
   * Calculate risk trends over time
   */
  private static calculateRiskTrends(errors: StockError[]): Array<{ period: string; riskLevel: number; contributors: string[] }> {
    // Simplified trend calculation - in practice would use actual timestamps
    const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const errorsPerPeriod = errors.length / periods.length;
    
    return periods.map((period, index) => {
      const periodErrorCount = Math.floor(errorsPerPeriod * (1 + (Math.random() - 0.5) * 0.4)); // Add some variance
      const riskLevel = periodErrorCount;
      
      const contributors = [];
      if (periodErrorCount > errorsPerPeriod * 1.2) contributors.push('Above average error rate');
      if (index === periods.length - 1) contributors.push('Recent period');
      
      return { period, riskLevel, contributors };
    });
  }

  /**
   * Identify emerging risks
   */
  private static identifyEmergingRisks(errors: StockError[]): Array<{ risk: string; likelihood: number; impact: string }> {
    const emergingRisks = [];
    
    const errorTypes = new Map<string, number>();
    errors.forEach(error => {
      const type = error.constructor.name;
      errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
    });

    const totalErrors = errors.length;
    const insufficientStockRatio = (errorTypes.get('InsufficientStockError') || 0) / totalErrors;
    
    if (insufficientStockRatio > 0.6) {
      emergingRisks.push({
        risk: 'Systematic inventory shortage',
        likelihood: 0.8,
        impact: 'High operational disruption'
      });
    }

    if (errorTypes.size > 4) {
      emergingRisks.push({
        risk: 'Process breakdown across multiple areas',
        likelihood: 0.6,
        impact: 'Medium to high operational impact'
      });
    }

    return emergingRisks;
  }

  /**
   * Extract location from error
   */
  private static extractErrorLocation(error: StockError): string | null {
    if ('location' in error && error.location && typeof error.location === 'string') {
      return error.location as string;
    } else if ('fromLocation' in error && error.fromLocation && typeof error.fromLocation === 'string') {
      return error.fromLocation as string;
    } else if ('toLocation' in error && error.toLocation && typeof error.toLocation === 'string') {
      return error.toLocation as string;
    }
    return null;
  }
}