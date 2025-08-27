/**
 * Benchmark Calculator
 * Core calculations for supplier benchmarks and performance metrics
 */

import { SupplierCrudService } from '../../supplier.crud';
import { log } from '@/lib/logger';
import { 
  PerformanceMetrics, 
  BenchmarkData, 
  CategoryStats, 
  BenchmarkCalculationParams
} from './benchmark-types';

/**
 * Core benchmark calculation engine
 */
export class BenchmarkCalculator {
  /**
   * Calculate performance benchmarks for the industry
   */
  static async calculateBenchmarks(params: BenchmarkCalculationParams = {}): Promise<BenchmarkData> {
    try {
      const suppliers = await SupplierCrudService.getAll();
      const activeSuppliers = this.filterSuppliers(suppliers, params);

      if (activeSuppliers.length === 0) {
        return this.getEmptyBenchmarkData();
      }

      const industryAverages = this.calculateIndustryAverages(activeSuppliers);
      const topPerformers = this.calculateTopPerformers(activeSuppliers, params.topPercentile || 0.1);
      const categoryBenchmarks = this.calculateCategoryBenchmarks(activeSuppliers);

      return {
        industryAverages,
        topPerformers,
        categoryBenchmarks
      };
    } catch (error) {
      log.error('Error calculating benchmarks:', { data: error }, 'benchmark-calculator');
      return this.getEmptyBenchmarkData();
    }
  }

  /**
   * Filter suppliers based on calculation parameters
   */
  private static filterSuppliers(suppliers: any[], params: BenchmarkCalculationParams): any[] {
    return suppliers.filter(supplier => {
      // Status filter
      if (!params.includeInactive && supplier.status !== 'active') {
        return false;
      }

      // Performance data requirement
      if (!supplier.performance) {
        return false;
      }

      // Minimum score filter
      if (params.minimumSampleSize && supplier.performance.overallScore < params.minimumSampleSize) {
        return false;
      }

      // Date range filter (if historical data available)
      if (params.dateRange) {
        // This would filter by supplier update date or performance date
        // For now, include all suppliers
      }

      return true;
    });
  }

  /**
   * Calculate industry-wide average performance metrics
   */
  private static calculateIndustryAverages(suppliers: any[]): PerformanceMetrics {
    const totals = suppliers.reduce((acc, supplier) => {
      const perf = supplier.performance as any;
      if (perf) {
        acc.overallScore += perf.overallScore || 0;
        acc.deliveryScore += perf.deliveryScore || 0;
        acc.qualityScore += perf.qualityScore || 0;
        acc.priceScore += perf.priceScore || 0;
        acc.serviceScore += perf.serviceScore || 0;
      }
      return acc;
    }, { overallScore: 0, deliveryScore: 0, qualityScore: 0, priceScore: 0, serviceScore: 0 });

    return {
      overallScore: Math.round(totals.overallScore / suppliers.length),
      deliveryScore: Math.round(totals.deliveryScore / suppliers.length),
      qualityScore: Math.round(totals.qualityScore / suppliers.length),
      priceScore: Math.round(totals.priceScore / suppliers.length),
      serviceScore: Math.round(totals.serviceScore / suppliers.length)
    };
  }

  /**
   * Calculate top performers average metrics
   */
  private static calculateTopPerformers(suppliers: any[], topPercentile: number): PerformanceMetrics {
    const topCount = Math.max(1, Math.floor(suppliers.length * topPercentile));
    const sortedSuppliers = [...suppliers].sort((a, b) => {
      const aScore = (a.performance as any)?.overallScore || 0;
      const bScore = (b.performance as any)?.overallScore || 0;
      return bScore - aScore;
    });

    const topPerformersData = sortedSuppliers.slice(0, topCount);
    const topTotals = topPerformersData.reduce((acc, supplier) => {
      const perf = supplier.performance as any;
      if (perf) {
        acc.overallScore += perf.overallScore || 0;
        acc.deliveryScore += perf.deliveryScore || 0;
        acc.qualityScore += perf.qualityScore || 0;
        acc.priceScore += perf.priceScore || 0;
        acc.serviceScore += perf.serviceScore || 0;
      }
      return acc;
    }, { overallScore: 0, deliveryScore: 0, qualityScore: 0, priceScore: 0, serviceScore: 0 });

    return {
      overallScore: Math.round(topTotals.overallScore / topPerformersData.length),
      deliveryScore: Math.round(topTotals.deliveryScore / topPerformersData.length),
      qualityScore: Math.round(topTotals.qualityScore / topPerformersData.length),
      priceScore: Math.round(topTotals.priceScore / topPerformersData.length),
      serviceScore: Math.round(topTotals.serviceScore / topPerformersData.length)
    };
  }

  /**
   * Calculate benchmark metrics for each category
   */
  private static calculateCategoryBenchmarks(suppliers: any[]): Record<string, { overallScore: number; sampleSize: number }> {
    const categoryGroups: Record<string, any[]> = {};

    // Group suppliers by category
    suppliers.forEach(supplier => {
      supplier.categories?.forEach((category: string) => {
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(supplier);
      });
    });

    // Calculate averages for each category
    const categoryBenchmarks: Record<string, { overallScore: number; sampleSize: number }> = {};
    Object.entries(categoryGroups).forEach(([category, categorySuppliers]) => {
      const totalScore = categorySuppliers.reduce((sum, supplier) => {
        return sum + ((supplier.performance as any)?.overallScore || 0);
      }, 0);

      categoryBenchmarks[category] = {
        overallScore: Math.round(totalScore / categorySuppliers.length),
        sampleSize: categorySuppliers.length
      };
    });

    return categoryBenchmarks;
  }

  /**
   * Get detailed category statistics
   */
  static async getCategoryStatistics(category: string): Promise<CategoryStats> {
    try {
      const allSuppliers = await SupplierCrudService.getAll();
      const categorySuppliers = allSuppliers.filter(supplier => 
        supplier.status === 'active' && 
        supplier.categories?.some(cat => cat.toString() === category.toString()) &&
        supplier.performance
      );

      const totalScore = categorySuppliers.reduce((sum, supplier) => {
        return sum + ((supplier.performance as any)?.overallScore || 0);
      }, 0);

      return {
        category,
        suppliers: categorySuppliers,
        averageScore: categorySuppliers.length > 0 ? Math.round(totalScore / categorySuppliers.length) : 0,
        sampleSize: categorySuppliers.length
      };
    } catch (error) {
      log.error(`Error getting category statistics for ${category}:`, { data: error }, 'benchmark-calculator');
      return {
        category,
        suppliers: [],
        averageScore: 0,
        sampleSize: 0
      };
    }
  }

  /**
   * Calculate percentile ranking for a specific score
   */
  static calculatePercentile(score: number, allScores: number[]): number {
    if (allScores.length === 0) return 0;
    
    const sortedScores = [...allScores].sort((a, b) => a - b);
    const rank = sortedScores.filter(s => s < score).length;
    return Math.round((rank / sortedScores.length) * 100);
  }

  /**
   * Calculate performance metrics differences
   */
  static calculateMetricsDifference(supplierMetrics: PerformanceMetrics, benchmarkMetrics: PerformanceMetrics) {
    return {
      overallDiff: supplierMetrics.overallScore - benchmarkMetrics.overallScore,
      deliveryDiff: supplierMetrics.deliveryScore - benchmarkMetrics.deliveryScore,
      qualityDiff: supplierMetrics.qualityScore - benchmarkMetrics.qualityScore,
      priceDiff: supplierMetrics.priceScore - benchmarkMetrics.priceScore,
      serviceDiff: supplierMetrics.serviceScore - benchmarkMetrics.serviceScore
    };
  }

  /**
   * Validate supplier performance data
   */
  static validatePerformanceData(supplier: any): {
    isValid: boolean;
    missingFields: string[];
    invalidValues: string[];
  } {
    const missingFields: string[] = [];
    const invalidValues: string[] = [];
    
    if (!supplier.performance) {
      return {
        isValid: false,
        missingFields: ['performance'],
        invalidValues: []
      };
    }

    const perf = supplier.performance;
    const requiredFields = ['overallScore', 'deliveryScore', 'qualityScore', 'priceScore', 'serviceScore'];
    
    requiredFields.forEach(field => {
      if (perf[field] === undefined || perf[field] === null) {
        missingFields.push(field);
      } else if (typeof perf[field] !== 'number' || perf[field] < 0 || perf[field] > 100) {
        invalidValues.push(`${field}: ${perf[field]} (should be 0-100)`);
      }
    });

    return {
      isValid: missingFields.length === 0 && invalidValues.length === 0,
      missingFields,
      invalidValues
    };
  }

  /**
   * Get empty benchmark data structure
   */
  private static getEmptyBenchmarkData(): BenchmarkData {
    return {
      industryAverages: { overallScore: 0, deliveryScore: 0, qualityScore: 0, priceScore: 0, serviceScore: 0 },
      topPerformers: { overallScore: 0, deliveryScore: 0, qualityScore: 0, priceScore: 0, serviceScore: 0 },
      categoryBenchmarks: {}
    };
  }
}