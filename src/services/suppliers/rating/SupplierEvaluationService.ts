/**
 * Supplier Evaluation Service
 * Handles performance evaluations and reports
 */

import { PerformancePeriod } from '@/types/supplier/base.types';
import { SupplierEvaluationReport, EvaluationActionItem } from './types';
import { SupplierPerformanceCalculator } from './performanceCalculator';

export class SupplierEvaluationService {
  /**
   * Generate performance evaluation report
   */
  static async generateEvaluationReport(
    supplierId: string,
    period: PerformancePeriod
  ): Promise<SupplierEvaluationReport> {
    try {
      const performance = await SupplierPerformanceCalculator.calculatePerformance(supplierId, period);
      const recommendations: string[] = [];
      const actionItems: EvaluationActionItem[] = [];

      // Generate recommendations based on performance
      if (performance.deliveryScore < 80) {
        recommendations.push('Improve delivery performance through better scheduling and logistics coordination');
        actionItems.push({
          priority: 'high',
          description: 'Schedule meeting to discuss delivery improvement strategies',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
        });
      }

      if (performance.qualityScore < 90) {
        recommendations.push('Enhance quality control processes to reduce defects');
        actionItems.push({
          priority: 'medium',
          description: 'Request quality improvement plan from supplier',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks from now
        });
      }

      if (performance.priceScore < 85) {
        recommendations.push('Review pricing competitiveness in the market');
        actionItems.push({
          priority: 'low',
          description: 'Conduct market price analysis for key items',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month from now
        });
      }

      if (performance.serviceScore < 80) {
        recommendations.push('Improve customer service and communication responsiveness');
        actionItems.push({
          priority: 'medium',
          description: 'Establish clear communication protocols and SLAs',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
        });
      }

      return {
        performance,
        recommendations,
        actionItems,
        generatedDate: new Date(),
        evaluationPeriod: period
      };
    } catch (error) {
      console.error(`Error generating evaluation report for ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Generate bulk evaluation reports
   */
  static async generateBulkEvaluationReports(
    supplierIds: string[],
    period: PerformancePeriod
  ): Promise<Map<string, SupplierEvaluationReport>> {
    const reports = new Map<string, SupplierEvaluationReport>();

    // Process in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < supplierIds.length; i += batchSize) {
      const batch = supplierIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (supplierId) => {
        try {
          const report = await this.generateEvaluationReport(supplierId, period);
          return { supplierId, report };
        } catch (error) {
          console.error(`Failed to generate report for supplier ${supplierId}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result) {
          reports.set(result.supplierId, result.report);
        }
      });
    }

    return reports;
  }

  /**
   * Get evaluation summary across multiple suppliers
   */
  static async getEvaluationSummary(
    supplierIds: string[],
    period: PerformancePeriod
  ): Promise<{
    totalSuppliers: number;
    averageScores: {
      overall: number;
      delivery: number;
      quality: number;
      price: number;
      service: number;
    };
    topPerformers: string[];
    underPerformers: string[];
    commonIssues: string[];
    recommendationsSummary: string[];
  }> {
    try {
      const reports = await this.generateBulkEvaluationReports(supplierIds, period);
      const reportList = Array.from(reports.values());

      if (reportList.length === 0) {
        return {
          totalSuppliers: 0,
          averageScores: { overall: 0, delivery: 0, quality: 0, price: 0, service: 0 },
          topPerformers: [],
          underPerformers: [],
          commonIssues: [],
          recommendationsSummary: []
        };
      }

      // Calculate average scores
      const totals = reportList.reduce((acc, report) => {
        const perf = report.performance;
        acc.overall += perf.overallScore;
        acc.delivery += perf.deliveryScore;
        acc.quality += perf.qualityScore;
        acc.price += perf.priceScore;
        acc.service += perf.serviceScore;
        return acc;
      }, { overall: 0, delivery: 0, quality: 0, price: 0, service: 0 });

      const averageScores = {
        overall: Math.round(totals.overall / reportList.length),
        delivery: Math.round(totals.delivery / reportList.length),
        quality: Math.round(totals.quality / reportList.length),
        price: Math.round(totals.price / reportList.length),
        service: Math.round(totals.service / reportList.length)
      };

      // Identify top performers (overall score > 85)
      const topPerformers = Array.from(reports.entries())
        .filter(([_, report]) => report.performance.overallScore > 85)
        .map(([supplierId]) => supplierId);

      // Identify underperformers (overall score < 70)
      const underPerformers = Array.from(reports.entries())
        .filter(([_, report]) => report.performance.overallScore < 70)
        .map(([supplierId]) => supplierId);

      // Collect common issues
      const issueFrequency: Record<string, number> = {};
      reportList.forEach(report => {
        if (report.performance.deliveryScore < 80) {
          issueFrequency['Delivery performance'] = (issueFrequency['Delivery performance'] || 0) + 1;
        }
        if (report.performance.qualityScore < 90) {
          issueFrequency['Quality control'] = (issueFrequency['Quality control'] || 0) + 1;
        }
        if (report.performance.priceScore < 85) {
          issueFrequency['Price competitiveness'] = (issueFrequency['Price competitiveness'] || 0) + 1;
        }
        if (report.performance.serviceScore < 80) {
          issueFrequency['Customer service'] = (issueFrequency['Customer service'] || 0) + 1;
        }
      });

      const commonIssues = Object.entries(issueFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([issue]) => issue);

      // Collect common recommendations
      const recommendationFrequency: Record<string, number> = {};
      reportList.forEach(report => {
        report.recommendations.forEach(rec => {
          recommendationFrequency[rec] = (recommendationFrequency[rec] || 0) + 1;
        });
      });

      const recommendationsSummary = Object.entries(recommendationFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([rec]) => rec);

      return {
        totalSuppliers: reportList.length,
        averageScores,
        topPerformers,
        underPerformers,
        commonIssues,
        recommendationsSummary
      };
    } catch (error) {
      console.error('Error getting evaluation summary:', error);
      throw error;
    }
  }

  /**
   * Generate action items summary
   */
  static async getActionItemsSummary(
    supplierIds: string[],
    period: PerformancePeriod
  ): Promise<{
    totalActionItems: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    upcomingDueDates: Array<{
      supplierId: string;
      description: string;
      priority: string;
      dueDate: Date;
    }>;
  }> {
    try {
      const reports = await this.generateBulkEvaluationReports(supplierIds, period);
      
      let totalActionItems = 0;
      let highPriority = 0;
      let mediumPriority = 0;
      let lowPriority = 0;
      const allActionItems: Array<{
        supplierId: string;
        description: string;
        priority: string;
        dueDate: Date;
      }> = [];

      reports.forEach((report, supplierId) => {
        report.actionItems.forEach(item => {
          totalActionItems++;
          
          switch (item.priority) {
            case 'high':
              highPriority++;
              break;
            case 'medium':
              mediumPriority++;
              break;
            case 'low':
              lowPriority++;
              break;
          }

          allActionItems.push({
            supplierId,
            description: item.description,
            priority: item.priority,
            dueDate: item.dueDate || new Date()
          });
        });
      });

      // Get upcoming due dates (next 30 days)
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const upcomingDueDates = allActionItems
        .filter(item => item.dueDate <= thirtyDaysFromNow)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 10); // Top 10 most urgent

      return {
        totalActionItems,
        highPriority,
        mediumPriority,
        lowPriority,
        upcomingDueDates
      };
    } catch (error) {
      console.error('Error getting action items summary:', error);
      return {
        totalActionItems: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        upcomingDueDates: []
      };
    }
  }
}