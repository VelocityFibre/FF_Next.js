/**
 * Trends Calculator
 * Handles trends calculation and historical data analysis
 */

import { Supplier } from '@/types/supplier/base.types';
import { 
  SupplierTrends,
} from '../scorecardTypes';
import { ScorecardCalculator } from '../scorecardCalculator';

export class TrendsCalculator {
  /**
   * Calculate performance trends over different periods
   */
  static async calculateTrends(supplier: Supplier): Promise<SupplierTrends> {
    // In a real implementation, this would query historical data
    // For now, we simulate trend data based on current metrics
    
    const currentScore = ScorecardCalculator.calculateOverallScore(supplier);
    
    try {
      // Simulate historical data with realistic variations
      const historicalVariation = this.generateHistoricalVariation(supplier);
      
      return {
        last3Months: this.normalizeScore(currentScore + (historicalVariation.recent * 0.5)),
        last6Months: this.normalizeScore(currentScore + historicalVariation.medium),
        last12Months: this.normalizeScore(currentScore + historicalVariation.longTerm)
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      return {
        last3Months: currentScore,
        last6Months: currentScore,
        last12Months: currentScore
      };
    }
  }

  /**
   * Generate realistic historical variation based on supplier characteristics
   */
  private static generateHistoricalVariation(supplier: Supplier): {
    recent: number;
    medium: number;
    longTerm: number;
  } {
    // Base variation on supplier stability indicators
    const baseVariation = this.calculateBaseVariation(supplier);
    
    return {
      recent: this.generateVariation(baseVariation, 0.3),   // ±3 points for recent
      medium: this.generateVariation(baseVariation, 0.6),   // ±6 points for medium term
      longTerm: this.generateVariation(baseVariation, 1.0)  // ±10 points for long term
    };
  }

  /**
   * Calculate base variation factor based on supplier characteristics
   */
  private static calculateBaseVariation(supplier: Supplier): number {
    let variationFactor = 10; // Base variation of ±10 points
    
    // Reduce variation for preferred suppliers (more stable)
    if (supplier.isPreferred) {
      variationFactor *= 0.7;
    }
    
    // Increase variation for newer suppliers
    if (supplier.createdAt) {
      const monthsSinceCreated = Math.floor(
        (Date.now() - new Date(supplier.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      
      if (monthsSinceCreated < 6) {
        variationFactor *= 1.5; // More volatile for new suppliers
      }
    }
    
    // Reduce variation for suppliers with good compliance
    const complianceScore = ScorecardCalculator.extractComplianceScore(supplier);
    if (complianceScore > 80) {
      variationFactor *= 0.8;
    }
    
    return variationFactor;
  }

  /**
   * Generate variation within specified range
   */
  private static generateVariation(baseVariation: number, factor: number): number {
    const maxVariation = baseVariation * factor;
    return (Math.random() * 2 - 1) * maxVariation; // Random value between -maxVariation and +maxVariation
  }

  /**
   * Normalize score to 0-100 range
   */
  private static normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate trend momentum
   */
  static calculateTrendMomentum(trends: SupplierTrends): {
    direction: 'improving' | 'declining' | 'stable';
    strength: 'strong' | 'moderate' | 'weak';
    momentum: number;
  } {
    const shortTermChange = trends.last3Months - trends.last6Months;
    const longTermChange = trends.last6Months - trends.last12Months;
    const overallChange = trends.last3Months - trends.last12Months;
    
    // Calculate momentum score
    const momentum = (shortTermChange * 0.5) + (longTermChange * 0.3) + (overallChange * 0.2);
    
    // Determine direction
    let direction: 'improving' | 'declining' | 'stable';
    if (momentum > 2) {
      direction = 'improving';
    } else if (momentum < -2) {
      direction = 'declining';
    } else {
      direction = 'stable';
    }
    
    // Determine strength
    let strength: 'strong' | 'moderate' | 'weak';
    const absChange = Math.abs(momentum);
    if (absChange > 5) {
      strength = 'strong';
    } else if (absChange > 2) {
      strength = 'moderate';
    } else {
      strength = 'weak';
    }
    
    return {
      direction,
      strength,
      momentum: Math.round(momentum * 10) / 10
    };
  }
}