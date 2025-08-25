/**
 * Supplier Scorecard Generator - Legacy Compatibility Layer
 * @deprecated Use modular components from './scorecard-generator' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './scorecard-generator' directly
 */

import {
  ScorecardScoreCalculator,
  ScorecardBenchmarkAnalyzer,
  ScorecardRecommendationEngine,
  type SupplierScorecard
} from './scorecard-generator';

export class ScorecardGenerator {
  /**
   * Generate comprehensive supplier scorecard
   * @deprecated Use ScorecardScoreCalculator, ScorecardBenchmarkAnalyzer, and ScorecardRecommendationEngine instead
   */
  static async generateSupplierScorecard(supplierId: string): Promise<SupplierScorecard> {
    try {
      // Get supplier data
      const supplierCrudService = await import('../supplier.crud');
      const supplier = await supplierCrudService.SupplierCrudService.getById(supplierId);
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const supplierName = supplier.companyName || supplier.name || 'Unknown';

      // Use modular components
      const overallScore = ScorecardScoreCalculator.calculateOverallScore(supplier);
      const ratings = ScorecardScoreCalculator.extractRatings(supplier);
      const performance = ScorecardScoreCalculator.extractPerformance(supplier);
      const compliance = ScorecardRecommendationEngine.extractCompliance(supplier);
      const trends = await ScorecardBenchmarkAnalyzer.calculateTrends(supplier);
      const benchmarks = await ScorecardBenchmarkAnalyzer.calculateBenchmarks(supplier);
      const recommendations = ScorecardRecommendationEngine.generateRecommendations(supplier, overallScore, compliance);

      const scorecard: SupplierScorecard = {
        supplierId,
        supplierName,
        overallScore,
        ratings,
        performance,
        compliance,
        trends,
        benchmarks,
        recommendations,
        lastUpdated: new Date()
      };

      console.log(`[ScorecardGenerator] Generated scorecard for supplier ${supplierName}: ${overallScore}/100`);
      return scorecard;
    } catch (error) {
      console.error('Error generating supplier scorecard:', error);
      throw new Error(`Failed to generate scorecard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate scorecards for multiple suppliers
   * @deprecated Use ScorecardScoreCalculator with batch processing instead
   */
  static async generateMultipleScorecards(supplierIds: string[]): Promise<SupplierScorecard[]> {
    const scorecards: SupplierScorecard[] = [];
    
    for (const supplierId of supplierIds) {
      try {
        const scorecard = await this.generateSupplierScorecard(supplierId);
        scorecards.push(scorecard);
      } catch (error) {
        console.warn(`Failed to generate scorecard for supplier ${supplierId}:`, error);
      }
    }

    return scorecards.sort((a, b) => b.overallScore - a.overallScore);
  }
}

// Re-export modular components for easier migration
export {
  ScorecardScoreCalculator,
  ScorecardBenchmarkAnalyzer,
  ScorecardRecommendationEngine
} from './scorecard-generator';