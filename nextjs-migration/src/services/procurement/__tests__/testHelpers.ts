/**
 * Test Helpers and Mock Utilities
 * Shared utilities for procurement API service tests
 */

import { vi } from 'vitest';
import { projectAccessMiddleware } from '../middleware/projectAccessMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';

// Mock dependencies for all tests
vi.mock('../middleware/projectAccessMiddleware');
vi.mock('../middleware/rbacMiddleware');
vi.mock('../auditLogger');
vi.mock('@/lib/neon/connection');

// Test context helper
export const createMockContext = (overrides = {}) => ({
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
export const mockSuccessfulAuth = () => {
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

// Mock failed project access
export const mockFailedProjectAccess = () => {
  vi.mocked(projectAccessMiddleware.checkProjectAccess).mockResolvedValue({
    success: false,
    error: 'Access denied',
    code: 'PROJECT_ACCESS_DENIED'
  });
};

// Mock insufficient permissions
export const mockInsufficientPermissions = () => {
  vi.mocked(rbacMiddleware.checkPermission).mockResolvedValue({
    success: false,
    error: 'Insufficient permissions',
    code: 'INSUFFICIENT_PERMISSIONS'
  });
};

// Mock database responses
export const mockBoqData = {
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

export const mockBoqItems = [
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

export const mockRfqData = {
  id: 'rfq-123',
  projectId: 'test-project-id',
  rfqNumber: 'RFQ-001',
  title: 'Test RFQ',
  description: 'Test RFQ Description',
  status: 'draft',
  responseDeadline: new Date('2024-02-15'),
  paymentTerms: '30 days',
  technicalRequirements: 'All certified equipment',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Database mock helpers
export const mockDatabaseSelect = (returnValue: any) => {
  const mockDb = vi.mocked(require('@/lib/neon/connection').db);
  mockDb.select.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue(returnValue)
          })
        })
      })
    })
  });
  return mockDb;
};

export const mockDatabaseInsert = (returnValue: any) => {
  const mockDb = vi.mocked(require('@/lib/neon/connection').db);
  mockDb.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(returnValue)
    })
  });
  return mockDb;
};

export const mockDatabaseError = (error: string) => {
  const mockDb = vi.mocked(require('@/lib/neon/connection').db);
  mockDb.select.mockImplementation(() => {
    throw new Error(error);
  });
  return mockDb;
};

// Test setup helpers
export const setupMocks = () => {
  vi.clearAllMocks();
  mockSuccessfulAuth();
};

export const teardownMocks = () => {
  vi.restoreAllMocks();
};

// Common test data generators
export const createValidBOQImportData = () => ({
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
});

export const createValidRFQData = () => ({
  title: 'Test RFQ',
  description: 'Test RFQ Description',
  responseDeadline: new Date('2024-02-15'),
  supplierIds: ['supplier-1', 'supplier-2'],
  paymentTerms: '30 days',
  technicalRequirements: 'All certified equipment'
});

export const createInvalidRFQData = () => ({
  // Missing required title
  responseDeadline: new Date('2024-02-15'),
  supplierIds: []
});