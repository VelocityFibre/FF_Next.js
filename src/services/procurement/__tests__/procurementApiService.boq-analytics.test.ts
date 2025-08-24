/**
 * Procurement API Service - BOQ Analytics Tests
 * Tests for BOQ statistics, completion metrics, and data analysis
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import {
  createMockContext,
  setupMocks,
  teardownMocks,
  mockBoqData,
  mockDatabaseSelect
} from './testHelpers';

describe('ProcurementApiService - BOQ Analytics', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('BOQ Statistics', () => {
    it('should calculate BOQ statistics correctly', async () => {
      const boqsWithStats = [
        { ...mockBoqData, status: 'draft', totalEstimatedValue: 10000 },
        { ...mockBoqData, status: 'approved', totalEstimatedValue: 20000 },
        { ...mockBoqData, status: 'in_progress', totalEstimatedValue: 15000 }
      ];
      mockDatabaseSelect(boqsWithStats);

      const context = createMockContext();
      const result = await procurementApiService.getBOQStatistics(context);

      expect(result.success).toBe(true);
      expect(result.data?.totalValue).toBe(45000);
      expect(result.data?.statusBreakdown.draft).toBe(1);
      expect(result.data?.statusBreakdown.approved).toBe(1);
    });

    it('should provide BOQ completion metrics', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const result = await procurementApiService.getBOQCompletionMetrics(context, 'boq-123');

      expect(result.success).toBe(true);
      expect(result.data?.completionPercentage).toBeDefined();
      expect(result.data?.mappingProgress).toBeDefined();
    });

    it('should calculate value distribution across statuses', async () => {
      const boqsByStatus = [
        { ...mockBoqData, status: 'draft', totalEstimatedValue: 50000 },
        { ...mockBoqData, status: 'approved', totalEstimatedValue: 75000 },
        { ...mockBoqData, status: 'in_progress', totalEstimatedValue: 25000 }
      ];
      mockDatabaseSelect(boqsByStatus);

      const context = createMockContext();
      const result = await procurementApiService.getBOQValueDistribution(context);

      expect(result.success).toBe(true);
      expect(result.data?.totalValue).toBe(150000);
      expect(result.data?.distribution.approved.percentage).toBe(50); // 75k out of 150k
    });

    it('should provide item mapping statistics', async () => {
      const boqsWithMapping = [
        { ...mockBoqData, itemCount: 100, mappedItems: 80, unmappedItems: 20 },
        { ...mockBoqData, itemCount: 50, mappedItems: 45, unmappedItems: 5 }
      ];
      mockDatabaseSelect(boqsWithMapping);

      const context = createMockContext();
      const result = await procurementApiService.getBOQMappingStatistics(context);

      expect(result.success).toBe(true);
      expect(result.data?.totalItems).toBe(150);
      expect(result.data?.totalMapped).toBe(125);
      expect(result.data?.mappingPercentage).toBe(83.33);
    });

    it('should track BOQ trends over time', async () => {
      const monthlyBoqs = [
        { ...mockBoqData, createdAt: new Date('2024-01-15'), totalEstimatedValue: 10000 },
        { ...mockBoqData, createdAt: new Date('2024-02-15'), totalEstimatedValue: 20000 },
        { ...mockBoqData, createdAt: new Date('2024-03-15'), totalEstimatedValue: 15000 }
      ];
      mockDatabaseSelect(monthlyBoqs);

      const context = createMockContext();
      const result = await procurementApiService.getBOQTrends(context, {
        period: 'monthly',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      });

      expect(result.success).toBe(true);
      expect(result.data?.trends).toHaveLength(3);
      expect(result.data?.totalValue).toBe(45000);
    });
  });

  describe('BOQ Performance Metrics', () => {
    it('should calculate average import processing time', async () => {
      const importMetrics = [
        { id: 'boq-1', processingTime: 120, itemCount: 100 }, // 1.2 sec per item
        { id: 'boq-2', processingTime: 180, itemCount: 200 }, // 0.9 sec per item
        { id: 'boq-3', processingTime: 150, itemCount: 150 }  // 1.0 sec per item
      ];
      mockDatabaseSelect(importMetrics);

      const context = createMockContext();
      const result = await procurementApiService.getBOQProcessingMetrics(context);

      expect(result.success).toBe(true);
      expect(result.data?.avgProcessingTime).toBe(150); // (120 + 180 + 150) / 3
      expect(result.data?.avgTimePerItem).toBe(1.03); // Weighted average
    });

    it('should track error rates during import', async () => {
      const importResults = [
        { id: 'boq-1', itemCount: 100, exceptionsCount: 5 },  // 5% error rate
        { id: 'boq-2', itemCount: 200, exceptionsCount: 10 }, // 5% error rate
        { id: 'boq-3', itemCount: 150, exceptionsCount: 0 }   // 0% error rate
      ];
      mockDatabaseSelect(importResults);

      const context = createMockContext();
      const result = await procurementApiService.getBOQErrorRates(context);

      expect(result.success).toBe(true);
      expect(result.data?.overallErrorRate).toBe(3.33); // 15 errors out of 450 items
      expect(result.data?.successfulImports).toBe(3);
    });

    it('should provide quality metrics', async () => {
      const qualityMetrics = [
        { id: 'boq-1', qualityScore: 0.95, completeness: 0.98, accuracy: 0.92 },
        { id: 'boq-2', qualityScore: 0.88, completeness: 0.85, accuracy: 0.91 },
        { id: 'boq-3', qualityScore: 0.92, completeness: 0.89, accuracy: 0.95 }
      ];
      mockDatabaseSelect(qualityMetrics);

      const context = createMockContext();
      const result = await procurementApiService.getBOQQualityMetrics(context);

      expect(result.success).toBe(true);
      expect(result.data?.avgQualityScore).toBe(0.92);
      expect(result.data?.avgCompleteness).toBe(0.91);
      expect(result.data?.avgAccuracy).toBe(0.93);
    });
  });

  describe('BOQ Comparison and Analysis', () => {
    it('should compare BOQs across projects', async () => {
      const projectBoqs = [
        { ...mockBoqData, projectId: 'project-1', totalEstimatedValue: 100000 },
        { ...mockBoqData, projectId: 'project-2', totalEstimatedValue: 150000 },
        { ...mockBoqData, projectId: 'project-3', totalEstimatedValue: 80000 }
      ];
      mockDatabaseSelect(projectBoqs);

      const context = createMockContext();
      const result = await procurementApiService.compareBOQsAcrossProjects(context, {
        projectIds: ['project-1', 'project-2', 'project-3']
      });

      expect(result.success).toBe(true);
      expect(result.data?.comparisons).toHaveLength(3);
      expect(result.data?.insights).toBeDefined();
    });

    it('should analyze cost variations', async () => {
      const costAnalysis = [
        { category: 'Materials', avgCost: 1000, variance: 0.15 },
        { category: 'Labor', avgCost: 800, variance: 0.20 },
        { category: 'Equipment', avgCost: 500, variance: 0.10 }
      ];
      mockDatabaseSelect(costAnalysis);

      const context = createMockContext();
      const result = await procurementApiService.analyzeBOQCostVariations(context, 'boq-123');

      expect(result.success).toBe(true);
      expect(result.data?.categories).toHaveLength(3);
      expect(result.data?.highVarianceCategories).toBeDefined();
    });

    it('should provide item frequency analysis', async () => {
      const itemFrequency = [
        { description: 'Fiber optic cable', frequency: 25, avgUnitPrice: 15.50 },
        { description: 'Network switch', frequency: 12, avgUnitPrice: 450.00 },
        { description: 'Cable tray', frequency: 8, avgUnitPrice: 85.00 }
      ];
      mockDatabaseSelect(itemFrequency);

      const context = createMockContext();
      const result = await procurementApiService.getBOQItemFrequencyAnalysis(context);

      expect(result.success).toBe(true);
      expect(result.data?.mostFrequentItems).toBeDefined();
      expect(result.data?.mostFrequentItems[0].description).toBe('Fiber optic cable');
    });
  });

  describe('BOQ Forecasting', () => {
    it('should predict future BOQ values', async () => {
      const historicalData = [
        { month: '2024-01', totalValue: 100000 },
        { month: '2024-02', totalValue: 120000 },
        { month: '2024-03', totalValue: 140000 }
      ];
      mockDatabaseSelect(historicalData);

      const context = createMockContext();
      const result = await procurementApiService.forecastBOQValues(context, {
        months: 3,
        confidenceInterval: 0.95
      });

      expect(result.success).toBe(true);
      expect(result.data?.forecast).toBeDefined();
      expect(result.data?.trend).toBeDefined();
    });

    it('should predict resource requirements', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const result = await procurementApiService.predictResourceRequirements(context, {
        projectType: 'fiber_network',
        estimatedValue: 500000
      });

      expect(result.success).toBe(true);
      expect(result.data?.predictions).toBeDefined();
      expect(result.data?.confidence).toBeDefined();
    });
  });

  describe('Reporting and Export', () => {
    it('should generate comprehensive BOQ report', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const result = await procurementApiService.generateBOQReport(context, 'boq-123', {
        format: 'pdf',
        includeAnalytics: true,
        includeComparisons: true
      });

      expect(result.success).toBe(true);
      expect(result.data?.reportUrl).toBeDefined();
      expect(result.data?.generatedAt).toBeDefined();
    });

    it('should export analytics data', async () => {
      mockDatabaseSelect([mockBoqData]);

      const context = createMockContext();
      const result = await procurementApiService.exportBOQAnalytics(context, {
        format: 'xlsx',
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31')
        },
        includeCharts: true
      });

      expect(result.success).toBe(true);
      expect(result.data?.exportUrl).toBeDefined();
      expect(result.data?.recordCount).toBeDefined();
    });
  });
});