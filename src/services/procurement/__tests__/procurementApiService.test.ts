/**
 * Procurement API Service Tests
 * Comprehensive test suite for procurement API endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import { projectAccessMiddleware } from '../middleware/projectAccessMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { auditLogger } from '../auditLogger';

// Mock dependencies
vi.mock('../middleware/projectAccessMiddleware');
vi.mock('../middleware/rbacMiddleware');
vi.mock('../auditLogger');
vi.mock('@/lib/neon/connection');

// Test context helper
const createMockContext = (overrides = {}) => ({
  userId: 'test-user-id',
  userName: 'Test User',
  userRole: 'procurement_officer',
  projectId: 'test-project-id',
  permissions: ['boq:read', 'boq:create', 'rfq:read'],
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  ...overrides
});

// Mock successful authorization
const mockSuccessfulAuth = () => {
  vi.mocked(projectAccessMiddleware.checkProjectAccess).mockResolvedValue({
    success: true,
    data: {
      projectId: 'test-project-id',
      accessLevel: 'write' as any,
      roles: ['procurement_officer'],
      departments: [],
      grantedBy: 'system',
      grantedAt: new Date()
    }
  });

  vi.mocked(rbacMiddleware.checkPermission).mockResolvedValue({
    success: true,
    data: true
  });
};

// Mock database responses
const mockBoqData = {
  id: 'boq-123',
  projectId: 'test-project-id',
  version: 'v1.0',
  title: 'Test BOQ',
  status: 'draft',
  itemCount: 10,
  mappedItems: 8,
  unmappedItems: 2,
  totalEstimatedValue: 50000,
  currency: 'ZAR',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockBoqItems = [
  {
    id: 'item-1',
    boqId: 'boq-123',
    projectId: 'test-project-id',
    lineNumber: 1,
    description: 'Fiber optic cable',
    quantity: 1000,
    uom: 'm',
    unitPrice: 15.50,
    totalPrice: 15500,
    mappingStatus: 'mapped',
    procurementStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe('ProcurementApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuccessfulAuth();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication and Authorization', () => {
    it('should validate user context and permissions', async () => {
      const context = createMockContext();
      
      await procurementApiService.getBOQs(context);

      expect(projectAccessMiddleware.checkProjectAccess).toHaveBeenCalledWith(
        context.userId,
        context.projectId
      );
      expect(rbacMiddleware.checkPermission).toHaveBeenCalledWith(
        context.userId,
        'boq:read',
        context.projectId
      );
    });

    it('should reject requests with invalid project access', async () => {
      vi.mocked(projectAccessMiddleware.checkProjectAccess).mockResolvedValue({
        success: false,
        error: 'Access denied',
        code: 'PROJECT_ACCESS_DENIED'
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('should reject requests with insufficient permissions', async () => {
      vi.mocked(rbacMiddleware.checkPermission).mockResolvedValue({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });
  });

  describe('getBOQs', () => {
    it('should return paginated BOQs with default parameters', async () => {
      // Mock database response
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockBoqData])
              })
            })
          })
        })
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        boqs: [mockBoqData],
        total: expect.any(Number),
        page: 1,
        limit: 20
      });
    });

    it('should apply filters correctly', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([])
              })
            })
          })
        })
      });

      const context = createMockContext();
      const filters = {
        status: 'approved',
        page: 2,
        limit: 10
      };

      const result = await procurementApiService.getBOQs(context, filters);

      expect(result.success).toBe(true);
      expect(result.data?.page).toBe(2);
      expect(result.data?.limit).toBe(10);
    });

    it('should log audit trail for view operations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockBoqData])
              })
            })
          })
        })
      });

      const context = createMockContext();
      await procurementApiService.getBOQs(context);

      expect(auditLogger.logAction).toHaveBeenCalledWith(
        context,
        'view',
        'boq',
        'list',
        null,
        null,
        expect.objectContaining({
          resultCount: expect.any(Number),
          total: expect.any(Number)
        })
      );
    });
  });

  describe('getBOQById', () => {
    it('should return BOQ with items and exceptions', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock BOQ query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockBoqData])
          })
        })
      });

      // Mock items query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockBoqItems)
          })
        })
      });

      // Mock exceptions query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'boq-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...mockBoqData,
        items: mockBoqItems,
        exceptions: []
      });
    });

    it('should return 404 for non-existent BOQ', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('BOQ not found');
    });
  });

  describe('importBOQ', () => {
    it('should import BOQ with valid data', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      
      // Mock BOQ insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...mockBoqData, id: 'new-boq-id' }])
        })
      });

      // Mock items insert
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockResolvedValue(undefined)
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'test_boq.xlsx',
        fileSize: 1024000,
        version: 'v1.0',
        title: 'Test BOQ Import',
        rows: [
          {
            lineNumber: 1,
            description: 'Test item',
            quantity: 100,
            uom: 'pcs',
            unitPrice: 10.50
          }
        ]
      };

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        boqId: 'new-boq-id',
        itemCount: 1,
        exceptionsCount: 0
      });
    });

    it('should validate import data structure', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const invalidData = {
        fileName: 'test.xlsx',
        // Missing required fields
        rows: []
      };

      const result = await procurementApiService.importBOQ(context, invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid BOQ import data');
    });
  });

  describe('createRFQ', () => {
    it('should create RFQ with valid data', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'rfq-123',
            projectId: 'test-project-id',
            rfqNumber: 'RFQ-001',
            title: 'Test RFQ',
            status: 'draft'
          }])
        })
      });

      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test RFQ Description',
        responseDeadline: new Date('2024-02-15'),
        supplierIds: ['supplier-1', 'supplier-2'],
        paymentTerms: '30 days',
        technicalRequirements: 'All certified equipment'
      };

      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('rfq-123');
      expect(result.data?.title).toBe('Test RFQ');
    });

    it('should validate RFQ data before creation', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const invalidRfqData = {
        // Missing required title
        responseDeadline: new Date('2024-02-15'),
        supplierIds: []
      };

      const result = await procurementApiService.createRFQ(context, invalidRfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid RFQ data');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });

    it('should handle validation errors properly', async () => {
      const context = createMockContext();
      const invalidData = null;

      const result = await procurementApiService.importBOQ(context, invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when database is accessible', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ count: 1 }])
        })
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('healthy');
      expect(result.data?.details?.database).toBe('connected');
    });

    it('should return unhealthy status when database is not accessible', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const result = await procurementApiService.getHealthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('unhealthy');
      expect(result.data?.details?.error).toBe('Connection failed');
    });
  });
});

// Integration test helpers
export const testHelpers = {
  createMockContext,
  mockSuccessfulAuth,
  mockBoqData,
  mockBoqItems
};

// Export for use in other test files
export { procurementApiService };