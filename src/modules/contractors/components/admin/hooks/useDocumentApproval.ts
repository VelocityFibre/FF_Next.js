import { useState, useEffect } from 'react';
import { contractorService } from '@/services/contractorService';
import { ContractorDocument } from '@/types/contractor.types';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { log } from '@/lib/logger';

export interface DocumentWithContractor extends ContractorDocument {
  contractorName: string | undefined;
  contractorId: string;
}

export type FilterStatus = 'all' | 'pending' | 'verified' | 'rejected';

interface UseDocumentApprovalProps {
  contractorId: string | undefined;
  onApprovalComplete: (() => void) | undefined;
}

export function useDocumentApproval({ 
  contractorId, 
  onApprovalComplete 
}: UseDocumentApprovalProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithContractor[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithContractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithContractor | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [contractorId]);

  useEffect(() => {
    applyFilters();
  }, [documents, filterStatus, searchTerm]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      
      if (contractorId) {
        // Load documents for specific contractor
        const docs = await contractorService.documents.getByContractor(contractorId);
        const contractor = await contractorService.getById(contractorId);
        const docsWithContractor: DocumentWithContractor[] = docs.map(doc => ({
          ...doc,
          contractorName: contractor?.companyName,
          contractorId
        }));
        setDocuments(docsWithContractor);
      } else {
        // Load all pending documents across all contractors
        const contractors = await contractorService.getAll();
        const allDocs: DocumentWithContractor[] = [];
        
        for (const contractor of contractors) {
          const docs = await contractorService.documents.getByContractor(contractor.id);
          const docsWithContractor = docs.map(doc => ({
            ...doc,
            contractorName: contractor.companyName,
            contractorId: contractor.id
          }));
          allDocs.push(...docsWithContractor);
        }
        
        setDocuments(allDocs);
      }
    } catch (error: any) {
      log.error('Failed to load documents:', { data: error }, 'useDocumentApproval');
      toast.error(error.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.verificationStatus === filterStatus);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.contractorName?.toLowerCase().includes(term) ||
        doc.fileName.toLowerCase().includes(term) ||
        doc.documentType.toLowerCase().includes(term)
      );
    }
    
    // Sort by upload date (newest first)
    filtered.sort((a, b) => 
      new Date(b.uploadedAt || b.createdAt).getTime() - new Date(a.uploadedAt || a.createdAt).getTime()
    );
    
    setFilteredDocuments(filtered);
  };

  const handleApprove = async (document: DocumentWithContractor) => {
    try {
      setIsProcessing(true);
      
      await contractorService.documents.verifyDocument(
        document.id,
        user?.email || 'system',
        'verified',
        undefined
      );
      
      // Update local state
      setDocuments(prevDocs => prevDocs.map(doc => {
        if (doc.id === document.id) {
          return {
            ...doc,
            verificationStatus: 'verified' as const,
            verifiedBy: user?.email || 'system',
            verifiedAt: new Date()
          } as DocumentWithContractor;
        }
        return doc;
      }));
      
      toast.success('Document approved successfully');
      
      if (onApprovalComplete) {
        onApprovalComplete();
      }
    } catch (error: any) {
      log.error('Failed to approve document:', { data: error }, 'useDocumentApproval');
      toast.error(error.message || 'Failed to approve document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDocument || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      await contractorService.documents.verifyDocument(
        selectedDocument.id,
        user?.email || 'system',
        'rejected',
        rejectionReason
      );
      
      // Update local state
      setDocuments(prevDocs => prevDocs.map(doc => {
        if (doc.id === selectedDocument.id) {
          return {
            ...doc,
            verificationStatus: 'rejected' as const,
            verifiedBy: user?.email || 'system',
            verifiedAt: new Date(),
            rejectionReason
          } as DocumentWithContractor;
        }
        return doc;
      }));
      
      toast.success('Document rejected');
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedDocument(null);
      
      if (onApprovalComplete) {
        onApprovalComplete();
      }
    } catch (error: any) {
      log.error('Failed to reject document:', { data: error }, 'useDocumentApproval');
      toast.error(error.message || 'Failed to reject document');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    documents,
    filteredDocuments,
    isLoading,
    selectedDocument,
    rejectionReason,
    showRejectionModal,
    isProcessing,
    filterStatus,
    searchTerm,
    setSelectedDocument,
    setRejectionReason,
    setShowRejectionModal,
    setFilterStatus,
    setSearchTerm,
    handleApprove,
    handleReject,
    loadDocuments
  };
}