/**
 * RFQ Analytics Tests
 * Tests for RFQ analytics, statistics, and reporting functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import {
  createMockContext,
  setupMocks,
  cleanupMocks,
  mockRfqData
} from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('RFQ Analytics', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('getRFQStatistics', () => {
    it('should provide comprehensive RFQ statistics', async () => {
      const rfqsWithStats = [
        { ...mockRfqData, id: 'rfq-1', status: 'draft', createdAt: new Date('2024-01-01') },
        { ...mockRfqData, id: 'rfq-2', status: 'published', createdAt: new Date('2024-01-15') },
        { ...mockRfqData, id: 'rfq-3', status: 'closed', createdAt: new Date('2024-02-01') },
        { ...mockRfqData, id: 'rfq-4', status: 'cancelled', createdAt: new Date('2024-02-15') }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithStats)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQStatistics(context);

      expect(result.success).toBe(true);
      expect(result.data?.totalRfqs).toBe(4);
      expect(result.data?.statusBreakdown).toEqual({
        draft: 1,
        published: 1,
        closed: 1,
        cancelled: 1
      });
      expect(result.data?.trendsOverTime).toBeDefined();
    });

    it('should calculate average RFQ lifecycle duration', async () => {
      const rfqsWithDurations = [
        { 
          ...mockRfqData, 
          status: 'closed',
          createdAt: new Date('2024-01-01'),
          publishedAt: new Date('2024-01-05'),
          closedAt: new Date('2024-01-20')
        },
        { 
          ...mockRfqData, 
          status: 'closed',
          createdAt: new Date('2024-02-01'),
          publishedAt: new Date('2024-02-03'),
          closedAt: new Date('2024-02-18')
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithDurations)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQStatistics(context);

      expect(result.success).toBe(true);
      expect(result.data?.averageLifecycleDuration).toBeDefined();
      expect(result.data?.averageLifecycleDuration?.draftToPublished).toBeDefined();
      expect(result.data?.averageLifecycleDuration?.publishedToClosed).toBeDefined();
    });

    it('should filter statistics by date range', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const dateFilter = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const result = await procurementApiService.getRFQStatistics(context, dateFilter);

      expect(result.success).toBe(true);
      expect(result.data?.dateRange).toEqual(dateFilter);
    });

    it('should provide monthly trend data', async () => {
      const rfqsAcrossMonths = [
        { ...mockRfqData, id: 'rfq-jan-1', createdAt: new Date('2024-01-15') },
        { ...mockRfqData, id: 'rfq-jan-2', createdAt: new Date('2024-01-25') },
        { ...mockRfqData, id: 'rfq-feb-1', createdAt: new Date('2024-02-10') },
        { ...mockRfqData, id: 'rfq-mar-1', createdAt: new Date('2024-03-05') }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsAcrossMonths)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQStatistics(context);

      expect(result.success).toBe(true);
      expect(result.data?.monthlyTrends).toBeDefined();
      expect(result.data?.monthlyTrends).toHaveLength(12); // All months
      expect(result.data?.monthlyTrends[0]).toEqual({ month: 1, count: 2 }); // January
      expect(result.data?.monthlyTrends[1]).toEqual({ month: 2, count: 1 }); // February
    });

    it('should calculate success rates', async () => {
      const rfqsWithOutcomes = [
        { ...mockRfqData, status: 'closed', awardedSupplierId: 'supplier-1' }, // Successful
        { ...mockRfqData, status: 'closed', awardedSupplierId: 'supplier-2' }, // Successful
        { ...mockRfqData, status: 'closed', awardedSupplierId: null }, // No award
        { ...mockRfqData, status: 'cancelled' } // Cancelled
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithOutcomes)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQStatistics(context);

      expect(result.success).toBe(true);
      expect(result.data?.successMetrics).toEqual({
        totalCompleted: 4,
        totalAwarded: 2,
        successRate: 50,
        cancellationRate: 25
      });
    });
  });

  describe('getRFQResponseRates', () => {
    it('should calculate overall response rates', async () => {
      const rfqsWithResponses = [
        {
          ...mockRfqData,
          id: 'rfq-1',
          supplierIds: ['s1', 's2', 's3'],
          responses: [
            { supplierId: 's1', status: 'submitted' },
            { supplierId: 's2', status: 'submitted' }
          ]
        },
        {
          ...mockRfqData,
          id: 'rfq-2',
          supplierIds: ['s1', 's3', 's4'],
          responses: [
            { supplierId: 's1', status: 'submitted' },
            { supplierId: 's3', status: 'submitted' },
            { supplierId: 's4', status: 'submitted' }
          ]
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithResponses)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQResponseRates(context);

      expect(result.success).toBe(true);
      expect(result.data?.averageResponseRate).toBeCloseTo(83.33, 2); // (2/3 + 3/3) / 2 * 100
      expect(result.data?.totalInvitations).toBe(6);
      expect(result.data?.totalResponses).toBe(5);
    });

    it('should provide supplier-specific response rates', async () => {
      const rfqsWithSupplierData = [
        {
          ...mockRfqData,
          supplierIds: ['supplier-1', 'supplier-2'],
          responses: [{ supplierId: 'supplier-1', status: 'submitted' }]
        },
        {
          ...mockRfqData,
          supplierIds: ['supplier-1', 'supplier-3'],
          responses: [
            { supplierId: 'supplier-1', status: 'submitted' },
            { supplierId: 'supplier-3', status: 'submitted' }
          ]
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithSupplierData)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQResponseRates(context);

      expect(result.success).toBe(true);
      expect(result.data?.supplierEngagement).toBeDefined();
      expect(result.data?.supplierEngagement['supplier-1']).toEqual({
        invitations: 2,
        responses: 2,
        responseRate: 100
      });
      expect(result.data?.supplierEngagement['supplier-2']).toEqual({
        invitations: 1,
        responses: 0,
        responseRate: 0
      });
    });

    it('should calculate response time analytics', async () => {
      const rfqsWithResponseTimes = [
        {
          ...mockRfqData,
          publishedAt: new Date('2024-01-01'),
          responses: [
            { 
              supplierId: 'supplier-1', 
              submittedAt: new Date('2024-01-05'), 
              status: 'submitted' 
            }
          ]
        },
        {
          ...mockRfqData,
          publishedAt: new Date('2024-01-10'),
          responses: [
            { 
              supplierId: 'supplier-2', 
              submittedAt: new Date('2024-01-12'), 
              status: 'submitted' 
            }
          ]
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithResponseTimes)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQResponseRates(context);

      expect(result.success).toBe(true);
      expect(result.data?.responseTimeAnalytics).toBeDefined();
      expect(result.data?.responseTimeAnalytics?.averageResponseTime).toBeDefined();
      expect(result.data?.responseTimeAnalytics?.fastestResponse).toBeDefined();
      expect(result.data?.responseTimeAnalytics?.slowestResponse).toBeDefined();
    });
  });

  describe('getRFQPerformanceMetrics', () => {
    it('should provide cost savings analysis', async () => {
      const rfqsWithCostData = [
        {
          ...mockRfqData,
          status: 'closed',
          estimatedValue: 100000,
          finalAwardValue: 85000,
          awardedSupplierId: 'supplier-1'
        },
        {
          ...mockRfqData,
          status: 'closed',
          estimatedValue: 50000,
          finalAwardValue: 48000,
          awardedSupplierId: 'supplier-2'
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithCostData)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQPerformanceMetrics(context);

      expect(result.success).toBe(true);
      expect(result.data?.costSavings).toEqual({
        totalEstimatedValue: 150000,
        totalAwardValue: 133000,
        totalSavings: 17000,
        savingsPercentage: expect.closeTo(11.33, 2)
      });
    });

    it('should analyze supplier competition metrics', async () => {
      const rfqsWithCompetition = [
        {
          ...mockRfqData,
          supplierIds: ['s1', 's2', 's3'],
          responses: [
            { supplierId: 's1', quotedValue: 10000 },
            { supplierId: 's2', quotedValue: 12000 },
            { supplierId: 's3', quotedValue: 9500 }
          ]
        },
        {
          ...mockRfqData,
          supplierIds: ['s1', 's2'],
          responses: [
            { supplierId: 's1', quotedValue: 5000 },
            { supplierId: 's2', quotedValue: 5200 }
          ]
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithCompetition)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQPerformanceMetrics(context);

      expect(result.success).toBe(true);
      expect(result.data?.competitionMetrics).toBeDefined();
      expect(result.data?.competitionMetrics?.averageBidsPerRFQ).toBeCloseTo(2.5, 1);
      expect(result.data?.competitionMetrics?.priceVariationAverage).toBeDefined();
    });

    it('should track cycle time improvements', async () => {
      const rfqsWithCycleTimes = [
        {
          ...mockRfqData,
          createdAt: new Date('2024-01-01'),
          publishedAt: new Date('2024-01-03'),
          closedAt: new Date('2024-01-20')
        },
        {
          ...mockRfqData,
          createdAt: new Date('2024-02-01'),
          publishedAt: new Date('2024-02-02'),
          closedAt: new Date('2024-02-15')
        },
        {
          ...mockRfqData,
          createdAt: new Date('2024-03-01'),
          publishedAt: new Date('2024-03-02'),
          closedAt: new Date('2024-03-12')
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(rfqsWithCycleTimes)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQPerformanceMetrics(context);

      expect(result.success).toBe(true);
      expect(result.data?.cycleTimeAnalysis).toBeDefined();
      expect(result.data?.cycleTimeAnalysis?.trend).toBeDefined(); // Should show improvement
      expect(result.data?.cycleTimeAnalysis?.averageCycleTime).toBeDefined();
    });
  });

  describe('getRFQSupplierAnalytics', () => {
    it('should analyze supplier participation patterns', async () => {
      const supplierParticipationData = [
        {
          supplierId: 'supplier-1',
          invitations: 5,
          responses: 4,
          awards: 2,
          averageQuoteValue: 15000,
          responseTimeAvg: 3.5
        },
        {
          supplierId: 'supplier-2',
          invitations: 3,
          responses: 3,
          awards: 1,
          averageQuoteValue: 12000,
          responseTimeAvg: 2.1
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue(supplierParticipationData)
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQSupplierAnalytics(context);

      expect(result.success).toBe(true);
      expect(result.data?.supplierPerformance).toBeDefined();
      expect(result.data?.supplierPerformance[0]).toEqual({
        supplierId: 'supplier-1',
        responseRate: 80,
        winRate: 50,
        averageQuoteValue: 15000,
        averageResponseTime: 3.5,
        reliability: 'high'
      });
    });

    it('should identify top performing suppliers', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([
              { supplierId: 'supplier-1', score: 95 },
              { supplierId: 'supplier-2', score: 88 },
              { supplierId: 'supplier-3', score: 76 }
            ])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQSupplierAnalytics(context);

      expect(result.success).toBe(true);
      expect(result.data?.topPerformers).toBeDefined();
      expect(result.data?.topPerformers).toHaveLength(3);
      expect(result.data?.topPerformers[0].supplierId).toBe('supplier-1');
    });

    it('should analyze supplier market coverage', async () => {
      const marketCoverageData = [
        {
          category: 'Fiber Optic Cables',
          supplierCount: 5,
          averageCompetition: 3.2,
          marketConcentration: 'moderate'
        },
        {
          category: 'Network Equipment',
          supplierCount: 3,
          averageCompetition: 2.1,
          marketConcentration: 'high'
        }
      ];
      
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          groupBy: vi.fn().mockResolvedValue(marketCoverageData)
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const result = await procurementApiService.getRFQSupplierAnalytics(context);

      expect(result.success).toBe(true);
      expect(result.data?.marketCoverage).toBeDefined();
      expect(result.data?.marketCoverage).toHaveLength(2);
      expect(result.data?.marketCoverage[0].category).toBe('Fiber Optic Cables');
    });
  });

  describe('generateRFQReport', () => {
    it('should generate comprehensive RFQ report', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const reportParams = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        includeSupplierAnalysis: true,
        includePerformanceMetrics: true
      };

      const result = await procurementApiService.generateRFQReport(context, reportParams);

      expect(result.success).toBe(true);
      expect(result.data?.reportId).toBeDefined();
      expect(result.data?.generatedAt).toBeDefined();
      expect(result.data?.summary).toBeDefined();
      expect(result.data?.sections).toBeDefined();
      expect(result.data?.sections).toContain('overview');
      expect(result.data?.sections).toContain('supplier_analysis');
      expect(result.data?.sections).toContain('performance_metrics');
    });

    it('should support custom report formats', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockRfqData])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:read'] });
      const reportParams = {
        format: 'executive_summary',
        includeCharts: true,
        groupBy: 'month'
      };

      const result = await procurementApiService.generateRFQReport(context, reportParams);

      expect(result.success).toBe(true);
      expect(result.data?.format).toBe('executive_summary');
      expect(result.data?.includesVisualizations).toBe(true);
    });
  });
});