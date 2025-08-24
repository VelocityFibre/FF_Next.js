/**
 * Shared test helpers and utilities
 * Common utilities used across procurement API service tests
 */

import { vi } from 'vitest';
import { projectAccessMiddleware } from '../../middleware/projectAccessMiddleware';
import { rbacMiddleware } from '../../middleware/rbacMiddleware';

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

// Mock BOQ data for testing
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

// Mock BOQ items for testing
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

// Mock RFQ data for testing
export const mockRfqData = {
  id: 'rfq-123',
  projectId: 'test-project-id',
  rfqNumber: 'RFQ-001',
  title: 'Test RFQ',
  description: 'Test RFQ Description',
  status: 'draft',
  responseDeadline: new Date('2024-02-15'),
  supplierIds: ['supplier-1', 'supplier-2'],
  paymentTerms: '30 days',
  technicalRequirements: 'All certified equipment',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Database mock helpers
export const createMockDbResponse = (data: any[]) => ({
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue(data)
          })
        })
      })
    })
  })
});

export const createMockDbInsert = (returnData: any[]) => ({
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(returnData)
    })
  })
});

export const createMockDbError = (errorMessage: string) => {
  const mockDb = vi.mocked(require('@/lib/neon/connection').db);
  mockDb.select.mockImplementation(() => {
    throw new Error(errorMessage);
  });
  return mockDb;
};

// Setup and cleanup helpers
export const setupMocks = () => {
  vi.clearAllMocks();
  mockSuccessfulAuth();
};

export const cleanupMocks = () => {
  vi.restoreAllMocks();
};

// Common test data generators
export const generateBoqImportData = (overrides = {}) => ({
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
  ],
  ...overrides
});

export const generateRfqData = (overrides = {}) => ({
  title: 'Test RFQ',
  description: 'Test RFQ Description',
  responseDeadline: new Date('2024-02-15'),
  supplierIds: ['supplier-1', 'supplier-2'],
  paymentTerms: '30 days',
  technicalRequirements: 'All certified equipment',
  ...overrides
});