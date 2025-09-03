/**
 * Test suite for contractorDocumentService
 * Focusing on Firebase index fallback functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contractorDocumentService } from './contractorDocumentService';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn((date) => ({ toDate: () => date })),
  },
}));

vi.mock('@/config/firebase', () => ({
  db: {},
}));

vi.mock('@/lib/neon/connection', () => ({
  neonDb: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn(),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn(),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn(),
    }),
  },
}));

vi.mock('@/lib/neon/schema', () => ({
  contractorDocuments: {},
}));

describe('contractorDocumentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByContractor', () => {
    it('should handle index errors gracefully with fallback query', async () => {
      const { getDocs, query, where, orderBy } = await import('firebase/firestore');
      
      // Mock the first query to throw an index error
      const indexError = new Error('The query requires an index');
      indexError.code = 'failed-precondition';
      
      const mockSnapshot = {
        docs: [
          {
            id: 'doc1',
            data: () => ({
              contractorId: 'contractor1',
              documentType: 'license',
              createdAt: { toDate: () => new Date('2024-01-01') },
            }),
          },
          {
            id: 'doc2', 
            data: () => ({
              contractorId: 'contractor1',
              documentType: 'insurance',
              createdAt: { toDate: () => new Date('2024-01-02') },
            }),
          },
        ],
      };

      // First call throws error, second call succeeds
      (getDocs as any)
        .mockRejectedValueOnce(indexError)
        .mockResolvedValueOnce(mockSnapshot);

      const result = await contractorDocumentService.getByContractor('contractor1');

      expect(result).toHaveLength(2);
      expect(result[0].documentType).toBe('insurance'); // Should be sorted by type
      expect(result[1].documentType).toBe('license');
      
      // Should have called getDocs twice (first fails, second succeeds with fallback)
      expect(getDocs).toHaveBeenCalledTimes(2);
    });

    it('should use optimized query when index is available', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      const mockSnapshot = {
        docs: [
          {
            id: 'doc1',
            data: () => ({
              contractorId: 'contractor1',
              documentType: 'license',
              createdAt: { toDate: () => new Date('2024-01-01') },
            }),
          },
        ],
      };

      (getDocs as any).mockResolvedValueOnce(mockSnapshot);

      const result = await contractorDocumentService.getByContractor('contractor1');

      expect(result).toHaveLength(1);
      expect(getDocs).toHaveBeenCalledTimes(1);
    });

    it('should throw error for non-index related errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      const networkError = new Error('Network error');
      (getDocs as any).mockRejectedValueOnce(networkError);

      await expect(
        contractorDocumentService.getByContractor('contractor1')
      ).rejects.toThrow('Failed to fetch contractor documents');
    });
  });

  describe('getExpiringDocuments', () => {
    it('should handle index errors with client-side filtering fallback', async () => {
      const { getDocs, Timestamp } = await import('firebase/firestore');
      
      const indexError = new Error('The query requires an index');
      indexError.code = 'failed-precondition';
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      
      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 45);

      const mockSnapshot = {
        docs: [
          {
            id: 'doc1',
            data: () => ({
              contractorId: 'contractor1',
              expiryDate: { toDate: () => futureDate },
              createdAt: { toDate: () => new Date('2024-01-01') },
            }),
          },
          {
            id: 'doc2',
            data: () => ({
              contractorId: 'contractor1', 
              expiryDate: { toDate: () => farFutureDate },
              createdAt: { toDate: () => new Date('2024-01-02') },
            }),
          },
        ],
      };

      (getDocs as any)
        .mockRejectedValueOnce(indexError)
        .mockResolvedValueOnce(mockSnapshot);

      const result = await contractorDocumentService.getExpiringDocuments(30);

      // Should only return documents expiring within 30 days
      expect(result).toHaveLength(1);
      expect(result[0].expiryDate).toEqual(futureDate);
      expect(getDocs).toHaveBeenCalledTimes(2);
    });
  });

  describe('mapDocuments helper', () => {
    it('should properly map Firestore documents to ContractorDocument objects', () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'doc1',
            data: () => ({
              contractorId: 'contractor1',
              documentType: 'license',
              issueDate: { toDate: () => new Date('2024-01-01') },
              expiryDate: { toDate: () => new Date('2024-12-31') },
              verifiedAt: { toDate: () => new Date('2024-01-02') },
              createdAt: { toDate: () => new Date('2024-01-01') },
              updatedAt: { toDate: () => new Date('2024-01-01') },
            }),
          },
        ],
      };

      const result = contractorDocumentService.mapDocuments(mockSnapshot);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'doc1',
        contractorId: 'contractor1',
        documentType: 'license',
        issueDate: expect.any(Date),
        expiryDate: expect.any(Date),
        verifiedAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});