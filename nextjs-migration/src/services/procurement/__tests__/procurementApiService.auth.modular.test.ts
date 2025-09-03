/**
 * Procurement API Service - Authentication & Authorization Tests
 * Focused test suite for auth-related functionality
 * Split from: procurementApiService.original.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import { projectAccessMiddleware } from '../middleware/projectAccessMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { 
  createMockContext, 
  mockSuccessfulAuth, 
  mockFailedAuth,
  setupTestEnvironment,
  cleanupTestEnvironment
} from './helpers/testHelpers';

describe('ProcurementApiService - Authentication & Authorization', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Authentication Validation', () => {
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
      mockFailedAuth('project');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('should reject requests with insufficient permissions', async () => {
      mockFailedAuth('permission');

      const context = createMockContext();
      const result = await procurementApiService.getBOQs(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });
  });

  describe('Context Validation', () => {
    it('should validate required context fields', async () => {
      const incompleteContext = createMockContext({ userId: undefined });
      
      const result = await procurementApiService.getBOQs(incompleteContext);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user context');
    });

    it('should validate project ID in context', async () => {
      const invalidContext = createMockContext({ projectId: '' });
      
      const result = await procurementApiService.getBOQs(invalidContext);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid project');
    });

    it('should handle missing permissions array', async () => {
      const contextWithoutPermissions = createMockContext({ permissions: undefined });
      
      const result = await procurementApiService.getBOQs(contextWithoutPermissions);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No permissions');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow procurement officers to access BOQ operations', async () => {
      const procurementContext = createMockContext({ 
        userRole: 'procurement_officer',
        permissions: ['boq:read', 'boq:create', 'boq:update']
      });
      
      await procurementApiService.getBOQs(procurementContext);
      
      expect(rbacMiddleware.checkPermission).toHaveBeenCalledWith(
        procurementContext.userId,
        'boq:read',
        procurementContext.projectId
      );
    });

    it('should restrict viewers from modifying operations', async () => {
      mockFailedAuth('permission');
      
      const viewerContext = createMockContext({ 
        userRole: 'viewer',
        permissions: ['boq:read'] // No write permissions
      });
      
      const result = await procurementApiService.createRFQ(viewerContext, {
        title: 'Test RFQ',
        description: 'Test Description',
        boqItems: []
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('should validate department-specific access', async () => {
      const departmentContext = createMockContext({ 
        userRole: 'department_user',
        permissions: ['boq:read'],
        department: 'procurement'
      });
      
      await procurementApiService.getBOQs(departmentContext);
      
      expect(projectAccessMiddleware.checkProjectAccess).toHaveBeenCalledWith(
        departmentContext.userId,
        departmentContext.projectId
      );
    });
  });

  describe('Session Security', () => {
    it('should log security events for failed authentication', async () => {
      mockFailedAuth('project');
      const auditLogger = vi.mocked(require('../auditLogger').auditLogger);
      
      const context = createMockContext();
      await procurementApiService.getBOQs(context);
      
      expect(auditLogger.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: context.userId,
          action: 'ACCESS_DENIED',
          resource: 'BOQ',
          reason: 'Project access denied'
        })
      );
    });

    it('should track user agent and IP for audit trails', async () => {
      const auditLogger = vi.mocked(require('../auditLogger').auditLogger);
      
      const context = createMockContext({
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser'
      });
      
      await procurementApiService.getBOQs(context);
      
      expect(auditLogger.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        })
      );
    });

    it('should handle concurrent session validation', async () => {
      const context = createMockContext();
      
      // Simulate concurrent requests
      const promises = Array(5).fill(null).map(() => 
        procurementApiService.getBOQs(context)
      );
      
      const results = await Promise.all(promises);
      
      // All should succeed with proper auth
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // Auth should be checked for each request
      expect(projectAccessMiddleware.checkProjectAccess).toHaveBeenCalledTimes(5);
    });
  });
});