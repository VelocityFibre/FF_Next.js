/**
 * Error Handling Tests
 * Tests for error handling and edge cases in procurement API service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import { 
  createMockContext, 
  setupMocks, 
  cleanupMocks, 
  createMockDbError
} from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('ProcurementApiService - Error Handling', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('Database Connection Errors', () => {
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

    it('should handle database timeout errors', async () => {
      createMockDbError('Connection timeout');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection timeout');
    });

    it('should handle database constraint violations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockImplementation(() => {
        const error = new Error('duplicate key value violates unique constraint');
        error.name = 'PostgresError';
        throw error;
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: []
      };

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Duplicate entry');
    });

    it('should handle database permission errors', async () => {
      createMockDbError('permission denied for relation boqs');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database access denied');
    });
  });

  describe('Validation Errors', () => {
    it('should handle validation errors properly', async () => {
      const context = createMockContext();
      const invalidData = null;

      const result = await procurementApiService.importBOQ(context, invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid data');
    });

    it('should handle missing required fields', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const incompleteData = {
        fileName: 'test.xlsx'
        // Missing other required fields
      };

      const result = await procurementApiService.importBOQ(context, incompleteData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    it('should handle invalid data types', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const invalidRfqData = {
        title: 123, // Should be string
        responseDeadline: 'invalid-date', // Should be Date
        supplierIds: 'not-an-array' // Should be array
      };

      const result = await procurementApiService.createRFQ(context, invalidRfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid data types');
    });

    it('should handle business rule violations', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const invalidBusinessData = {
        title: 'Test RFQ',
        responseDeadline: new Date('2020-01-01'), // Past date
        supplierIds: []
      };

      const result = await procurementApiService.createRFQ(context, invalidBusinessData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Business rule violation');
    });
  });

  describe('Authentication and Authorization Errors', () => {
    it('should handle missing user context', async () => {
      const result = await procurementApiService.getBOQs(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user context');
    });

    it('should handle invalid user ID', async () => {
      const contextWithInvalidUser = createMockContext({
        userId: ''
      });

      const result = await procurementApiService.getBOQs(contextWithInvalidUser);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user ID');
    });

    it('should handle authentication service errors', async () => {
      const { projectAccessMiddleware } = await import('../../middleware/projectAccessMiddleware');
      vi.mocked(projectAccessMiddleware.checkProjectAccess).mockRejectedValue(
        new Error('Authentication service unavailable')
      );

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
    });

    it('should handle authorization service errors', async () => {
      const { rbacMiddleware } = await import('../../middleware/rbacMiddleware');
      vi.mocked(rbacMiddleware.checkPermission).mockRejectedValue(
        new Error('Authorization service unavailable')
      );

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authorization failed');
    });
  });

  describe('Resource Not Found Errors', () => {
    it('should handle BOQ not found', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('BOQ not found');
    });

    it('should handle RFQ not found', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      const result = await procurementApiService.updateRFQ(context, 'non-existent-id', { title: 'New Title' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('RFQ not found');
    });

    it('should handle project not found', async () => {
      const { projectAccessMiddleware } = await import('../../middleware/projectAccessMiddleware');
      vi.mocked(projectAccessMiddleware.checkProjectAccess).mockResolvedValue({
        success: false,
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Project not found');
    });
  });

  describe('File Processing Errors', () => {
    it('should handle file upload errors', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const fileData = {
        fileName: 'corrupted.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: null // Simulates file parsing failure
      };

      const result = await procurementApiService.importBOQ(context, fileData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File processing failed');
    });

    it('should handle unsupported file formats', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const fileData = {
        fileName: 'test.pdf', // Unsupported format
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: []
      };

      const result = await procurementApiService.importBOQ(context, fileData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file format');
    });

    it('should handle file size limit exceeded', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const oversizedFile = {
        fileName: 'large.xlsx',
        fileSize: 100 * 1024 * 1024, // 100MB
        version: 'v1.0',
        title: 'Test',
        rows: []
      };

      const result = await procurementApiService.importBOQ(context, oversizedFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds limit');
    });
  });

  describe('Network and Service Errors', () => {
    it('should handle network timeout errors', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockImplementation(() => {
        const error = new Error('Request timeout');
        error.name = 'TimeoutError';
        throw error;
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Request timeout');
    });

    it('should handle service unavailable errors', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockImplementation(() => {
        const error = new Error('Service temporarily unavailable');
        error.name = 'ServiceUnavailableError';
        throw error;
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Service temporarily unavailable');
    });
  });

  describe('Rate Limiting and Throttling', () => {
    it('should handle rate limit exceeded errors', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockImplementation(() => {
        const error = new Error('Rate limit exceeded');
        error.name = 'RateLimitError';
        throw error;
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should handle concurrent request limits', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.select.mockImplementation(() => {
        const error = new Error('Too many concurrent requests');
        error.name = 'ConcurrencyLimitError';
        throw error;
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many concurrent requests');
    });
  });

  describe('Data Consistency Errors', () => {
    it('should handle data integrity violations', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.insert.mockImplementation(() => {
        const error = new Error('Foreign key constraint violation');
        error.name = 'ForeignKeyConstraintError';
        throw error;
      });

      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: [{
          lineNumber: 1,
          description: 'Test item',
          quantity: 100,
          uom: 'pcs',
          unitPrice: 10.50
        }]
      };

      const result = await procurementApiService.importBOQ(context, importData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Data integrity violation');
    });

    it('should handle concurrent modification conflicts', async () => {
      const mockDb = vi.mocked(require('@/lib/neon/connection').db);
      mockDb.update.mockImplementation(() => {
        const error = new Error('Record has been modified by another user');
        error.name = 'OptimisticLockError';
        throw error;
      });

      const context = createMockContext({ permissions: ['rfq:update'] });
      
      // First mock the select to return existing RFQ
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'rfq-123',
              version: 1,
              status: 'draft'
            }])
          })
        })
      });

      const result = await procurementApiService.updateRFQ(context, 'rfq-123', { title: 'Updated Title' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Record has been modified');
    });
  });
});