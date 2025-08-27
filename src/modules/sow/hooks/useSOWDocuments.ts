import { useState, useEffect } from 'react';
import { SOWListItem } from '../types/sow.types';
import { SOWDocumentType, DocumentStatus } from '@/modules/projects/types/project.types';
import { log } from '@/lib/logger';

export function useSOWDocuments() {
  const [sowDocuments, setSowDocuments] = useState<SOWListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSOWDocuments = async () => {
    try {
      // Mock data for demonstration
      const mockDocuments: SOWListItem[] = [
        {
          id: 'sow1',
          name: 'Lawrenceburg Phase 1 - Poles.xlsx',
          type: SOWDocumentType.POLES,
          fileUrl: '/files/poles.xlsx',
          uploadDate: '2024-01-15T10:30:00',
          uploadedBy: 'user1',
          uploadedByName: 'John Smith',
          version: 1,
          status: DocumentStatus.APPROVED,
          projectName: 'Lawrenceburg Fiber Expansion',
          projectCode: 'LAW',
          metadata: {
            poleCount: 450,
            estimatedCost: 225000
          }
        },
        {
          id: 'sow2',
          name: 'Lawrenceburg Phase 1 - Drops.xlsx',
          type: SOWDocumentType.DROPS,
          fileUrl: '/files/drops.xlsx',
          uploadDate: '2024-01-15T11:00:00',
          uploadedBy: 'user1',
          uploadedByName: 'John Smith',
          version: 1,
          status: DocumentStatus.APPROVED,
          projectName: 'Lawrenceburg Fiber Expansion',
          projectCode: 'LAW',
          metadata: {
            dropCount: 1200,
            estimatedCost: 180000
          }
        },
        {
          id: 'sow3',
          name: 'Anderson Network - Fiber Routes.xlsx',
          type: SOWDocumentType.CABLE,
          fileUrl: '/files/cable.xlsx',
          uploadDate: '2024-01-16T09:15:00',
          uploadedBy: 'user2',
          uploadedByName: 'Jane Doe',
          version: 2,
          status: DocumentStatus.PENDING,
          projectName: 'Anderson Network Upgrade',
          projectCode: 'AND',
          metadata: {
            cableLength: 45000,
            estimatedCost: 450000
          }
        },
        {
          id: 'sow4',
          name: 'Greenville Expansion - Drops Phase 2.xlsx',
          type: SOWDocumentType.DROPS,
          fileUrl: '/files/drops2.xlsx',
          uploadDate: '2024-01-17T14:20:00',
          uploadedBy: 'user3',
          uploadedByName: 'Mike Johnson',
          version: 1,
          status: DocumentStatus.PENDING,
          projectName: 'Greenville Network Build',
          projectCode: 'GRN',
          metadata: {
            dropCount: 800,
            estimatedCost: 120000
          }
        },
        {
          id: 'sow5',
          name: 'Madison District - Trench Requirements.xlsx',
          type: SOWDocumentType.TRENCH,
          fileUrl: '/files/trench.xlsx',
          uploadDate: '2024-01-18T08:45:00',
          uploadedBy: 'user2',
          uploadedByName: 'Jane Doe',
          version: 1,
          status: DocumentStatus.REJECTED,
          projectName: 'Madison Metro Fiber',
          projectCode: 'MAD',
          rejectionReason: 'Missing depth specifications for underground sections',
          metadata: {
            trenchLength: 15000,
            estimatedCost: 300000
          }
        }
      ];

      setSowDocuments(mockDocuments);
      setLoading(false);
    } catch (error) {
      log.error('Error loading SOW documents:', { data: error }, 'useSOWDocuments');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSOWDocuments();
  }, []);

  const deleteDocument = async (id: string) => {
    setSowDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const downloadDocument = async (_doc: SOWListItem) => {

    // Implement actual download logic
  };

  return {
    sowDocuments,
    loading,
    deleteDocument,
    downloadDocument,
    refreshDocuments: loadSOWDocuments
  };
}