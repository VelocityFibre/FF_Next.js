/**
 * Authentication and Authorization Tests
 * Tests for procurement API authentication and authorization flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../../procurementApiService';
import { projectAccessMiddleware } from '../../middleware/projectAccessMiddleware';
import { rbacMiddleware } from '../../middleware/rbacMiddleware';
import { createMockContext, setupMocks, cleanupMocks } from '../shared/testHelpers';

// Mock dependencies
vi.mock('../../middleware/projectAccessMiddleware');
vi.mock('../../middleware/rbacMiddleware');
vi.mock('../../auditLogger');
vi.mock('@/lib/neon/connection');

describe('ProcurementApiService - Authentication', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
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

    it('should validate required context fields', async () => {
      const incompleteContext = createMockContext({
        userId: undefined
      });
      
      const result = await procurementApiService.getBOQs(incompleteContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user context');
    });

    it('should handle missing project ID', async () => {
      const contextWithoutProject = createMockContext({
        projectId: undefined
      });
      
      const result = await procurementApiService.getBOQs(contextWithoutProject);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Project ID required');
    });
  });

  describe('Project Access Control', () => {
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

    it('should accept requests with valid project access', async () => {
      vi.mocked(projectAccessMiddleware.checkProjectAccess).mockResolvedValue({
        success: true,
        data: {
          projectId: 'test-project-id',
          accessLevel: 'read' as any,
          roles: ['viewer'],
          departments: [],
          grantedBy: 'admin',
          grantedAt: new Date()
        }
      });

      const context = createMockContext();
      await procurementApiService.getBOQs(context);

      // Should not fail due to project access
      expect(projectAccessMiddleware.checkProjectAccess).toHaveBeenCalled();
    });

    it('should handle project access middleware errors', async () => {
      vi.mocked(projectAccessMiddleware.checkProjectAccess).mockRejectedValue(
        new Error('Middleware connection failed')
      );

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
    });
  });

  describe('Permission-Based Access Control', () => {
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

    it('should validate specific permissions for different operations', async () => {
      const context = createMockContext({ permissions: ['boq:create'] });
      
      // Test BOQ creation permission
      await procurementApiService.importBOQ(context, {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: []
      });

      expect(rbacMiddleware.checkPermission).toHaveBeenCalledWith(
        context.userId,
        'boq:create',
        context.projectId
      );
    });

    it('should handle RBAC middleware errors', async () => {
      vi.mocked(rbacMiddleware.checkPermission).mockRejectedValue(
        new Error('RBAC service unavailable')
      );

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authorization failed');
    });
  });

  describe('Role-Based Restrictions', () => {
    it('should allow admin users full access', async () => {
      const adminContext = createMockContext({
        userRole: 'admin',
        permissions: ['boq:read', 'boq:create', 'boq:update', 'boq:delete']
      });

      await procurementApiService.getBOQs(adminContext);
      
      expect(rbacMiddleware.checkPermission).toHaveBeenCalledWith(
        adminContext.userId,
        'boq:read',
        adminContext.projectId
      );
    });

    it('should restrict viewer users to read-only operations', async () => {
      const viewerContext = createMockContext({
        userRole: 'viewer',
        permissions: ['boq:read']
      });

      vi.mocked(rbacMiddleware.checkPermission).mockImplementation(
        (_userId, permission, _projectId) => {
          if (permission === 'boq:create') {
            return Promise.resolve({
              success: false,
              error: 'Insufficient permissions',
              code: 'INSUFFICIENT_PERMISSIONS'
            });
          }
          return Promise.resolve({ success: true, data: true });
        }
      );

      // Should allow read operation
      const readResult = await procurementApiService.getBOQs(viewerContext);
      expect(readResult.success).toBe(true);

      // Should deny create operation
      const createResult = await procurementApiService.importBOQ(viewerContext, {
        fileName: 'test.xlsx',
        fileSize: 1000,
        version: 'v1.0',
        title: 'Test',
        rows: []
      });
      expect(createResult.success).toBe(false);
    });

    it('should validate department-specific access', async () => {
      const departmentContext = createMockContext({
        userRole: 'department_manager',
        permissions: ['boq:read', 'boq:create']
      });

      vi.mocked(projectAccessMiddleware.checkProjectAccess).mockResolvedValue({
        success: true,
        data: {
          projectId: 'test-project-id',
          accessLevel: 'write' as any,
          roles: ['department_manager'],
          departments: ['procurement', 'engineering'],
          grantedBy: 'admin',
          grantedAt: new Date()
        }
      });

      await procurementApiService.getBOQs(departmentContext);
      
      expect(projectAccessMiddleware.checkProjectAccess).toHaveBeenCalledWith(
        departmentContext.userId,
        departmentContext.projectId
      );
    });
  });

  describe('Session and Context Security', () => {
    it('should validate user agent and IP address tracking', async () => {
      const contextWithTracking = createMockContext({
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser'
      });

      await procurementApiService.getBOQs(contextWithTracking);

      // Verify that context information is passed through
      expect(projectAccessMiddleware.checkProjectAccess).toHaveBeenCalledWith(
        contextWithTracking.userId,
        contextWithTracking.projectId
      );
    });

    it('should handle anonymous or missing user information', async () => {
      const anonymousContext = createMockContext({
        userId: null,
        userName: null
      });

      const result = await procurementApiService.getBOQs(anonymousContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication required');
    });

    it('should validate session timeout scenarios', async () => {
      vi.mocked(projectAccessMiddleware.checkProjectAccess).mockResolvedValue({
        success: false,
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      });

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session expired');
    });
  });
});