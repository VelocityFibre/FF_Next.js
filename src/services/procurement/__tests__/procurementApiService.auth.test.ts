/**
 * Procurement API Service - Authentication and Authorization Tests
 * Tests for user context validation and permissions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import { projectAccessMiddleware } from '../middleware/projectAccessMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import {
  createMockContext,
  setupMocks,
  teardownMocks,
  mockFailedProjectAccess,
  mockInsufficientPermissions
} from './testHelpers';

describe('ProcurementApiService - Authentication & Authorization', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    teardownMocks();
  });

  describe('User Context Validation', () => {
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

    it('should validate context for different operations', async () => {
      const context = createMockContext({ permissions: ['rfq:read'] });
      
      await procurementApiService.getRFQs(context);

      expect(rbacMiddleware.checkPermission).toHaveBeenCalledWith(
        context.userId,
        'rfq:read',
        context.projectId
      );
    });
  });

  describe('Project Access Control', () => {
    it('should reject requests with invalid project access', async () => {
      mockFailedProjectAccess();

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('should enforce project-level permissions for BOQ operations', async () => {
      mockFailedProjectAccess();

      const context = createMockContext();
      const result = await procurementApiService.getBOQById(context, 'boq-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('should enforce project-level permissions for RFQ operations', async () => {
      mockFailedProjectAccess();

      const context = createMockContext();
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test Description',
        responseDeadline: new Date(),
        supplierIds: ['supplier-1']
      };
      
      const result = await procurementApiService.createRFQ(context, rfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });
  });

  describe('Permission-Based Access Control', () => {
    it('should reject requests with insufficient permissions', async () => {
      mockInsufficientPermissions();

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('should check specific permissions for create operations', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      const importData = {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: []
      };
      
      await procurementApiService.importBOQ(context, importData);

      expect(rbacMiddleware.checkPermission).toHaveBeenCalledWith(
        context.userId,
        'boq:create',
        context.projectId
      );
    });

    it('should check specific permissions for RFQ creation', async () => {
      const context = createMockContext({ permissions: ['rfq:create'] });
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test',
        responseDeadline: new Date(),
        supplierIds: ['supplier-1']
      };
      
      await procurementApiService.createRFQ(context, rfqData);

      expect(rbacMiddleware.checkPermission).toHaveBeenCalledWith(
        context.userId,
        'rfq:create',
        context.projectId
      );
    });
  });

  describe('Role-Based Operations', () => {
    it('should allow procurement officers to access BOQ operations', async () => {
      const context = createMockContext({ 
        userRole: 'procurement_officer',
        permissions: ['boq:read', 'boq:create', 'boq:update'] 
      });
      
      const result = await procurementApiService.getBOQs(context);
      
      expect(projectAccessMiddleware.checkProjectAccess).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should allow project managers to access all procurement operations', async () => {
      const context = createMockContext({ 
        userRole: 'project_manager',
        permissions: ['boq:read', 'boq:create', 'rfq:read', 'rfq:create'] 
      });
      
      const result = await procurementApiService.getBOQs(context);
      
      expect(result.success).toBe(true);
    });

    it('should restrict viewers to read-only operations', async () => {
      mockInsufficientPermissions();
      
      const context = createMockContext({ 
        userRole: 'viewer',
        permissions: ['boq:read'] 
      });
      
      const importData = {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: []
      };
      
      const result = await procurementApiService.importBOQ(context, importData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });
  });

  describe('Context Validation', () => {
    it('should reject requests with missing user ID', async () => {
      const context = createMockContext({ userId: undefined });
      
      const result = await procurementApiService.getBOQs(context);
      
      expect(result.success).toBe(false);
    });

    it('should reject requests with missing project ID', async () => {
      const context = createMockContext({ projectId: undefined });
      
      const result = await procurementApiService.getBOQs(context);
      
      expect(result.success).toBe(false);
    });

    it('should validate complete context for sensitive operations', async () => {
      const incompleteContext = {
        userId: 'user-1',
        projectId: 'project-1'
        // Missing other required fields
      };
      
      const result = await procurementApiService.importBOQ(incompleteContext, {});
      
      expect(result.success).toBe(false);
    });
  });
});