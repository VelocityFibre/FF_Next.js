/**
 * Shared Test Helpers for Procurement API Tests
 * Common mocks, utilities, and data for procurement service tests
 */

import { vi } from 'vitest';

// 🟢 WORKING: Test context helper
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

// 🟢 WORKING: Mock successful authorization
export const mockSuccessfulAuth = () => {
  const projectAccessMiddleware = vi.mocked(require('../middleware/projectAccessMiddleware').projectAccessMiddleware);
  const rbacMiddleware = vi.mocked(require('../middleware/rbacMiddleware').rbacMiddleware);
  
  projectAccessMiddleware.checkProjectAccess.mockResolvedValue({
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

  rbacMiddleware.checkPermission.mockResolvedValue({
    success: true,
    data: true
  });
};

// 🟢 WORKING: Mock failed authorization
export const mockFailedAuth = (reason: 'project' | 'permission') => {
  const projectAccessMiddleware = vi.mocked(require('../middleware/projectAccessMiddleware').projectAccessMiddleware);
  const rbacMiddleware = vi.mocked(require('../middleware/rbacMiddleware').rbacMiddleware);
  
  if (reason === 'project') {
    projectAccessMiddleware.checkProjectAccess.mockResolvedValue({
      success: false,
      error: 'Access denied',
      code: 'PROJECT_ACCESS_DENIED'
    });
  } else {
    rbacMiddleware.checkPermission.mockResolvedValue({
      success: false,
      error: 'Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
};

// 🟢 WORKING: Mock database responses
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
  },
  {
    id: 'item-2',
    boqId: 'boq-123',
    projectId: 'test-project-id',
    lineNumber: 2,
    description: 'Junction box',
    quantity: 50,
    uom: 'each',
    unitPrice: 25.00,
    totalPrice: 1250,
    mappingStatus: 'mapped',
    procurementStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockRfqData = {
  id: 'rfq-456',
  projectId: 'test-project-id',
  title: 'Test RFQ',
  description: 'Request for quotation test',
  status: 'draft',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  items: mockBoqItems,
  suppliers: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

// 🟢 WORKING: Mock database setup
export const setupMockDatabase = () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis()
  };

  // Mock resolved values for different operations
  mockDb.offset.mockResolvedValue([mockBoqData]);
  mockDb.returning.mockResolvedValue([mockBoqData]);
  
  return mockDb;
};

// 🟢 WORKING: Common test setup
export const setupTestEnvironment = () => {
  // Mock dependencies
  vi.mock('../middleware/projectAccessMiddleware');
  vi.mock('../middleware/rbacMiddleware');
  vi.mock('../auditLogger');
  vi.mock('@/lib/neon/connection');
  
  // Setup successful auth by default
  mockSuccessfulAuth();
  
  return {
    mockDb: setupMockDatabase()
  };
};

// 🟢 WORKING: Common test cleanup
export const cleanupTestEnvironment = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};