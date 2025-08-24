import { useState, useEffect } from 'react';
import { ContractorDocument } from '@/types/contractor.types';
import { contractorService } from '@/services/contractorService';
import { ONBOARDING_STAGES } from '../constants/onboardingStages';
import { calculateOverallProgress, checkMissingRequiredDocuments } from '../utils/progressUtils';
import toast from 'react-hot-toast';

export function useOnboardingWorkflow(contractorId: string, onStatusChange?: (status: string) => void) {
  const [documents, setDocuments] = useState<ContractorDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<string[]>(['company_info']);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [contractorId]);

  useEffect(() => {
    const progress = calculateOverallProgress(ONBOARDING_STAGES, documents);
    setOverallProgress(progress);
  }, [documents]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await contractorService.documents.getByContractor(contractorId);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages(prev =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleDocumentUpload = (document: ContractorDocument) => {
    setDocuments(prev => [...prev.filter(d => d.id !== document.id), document]);
    toast.success('Document uploaded successfully');
  };

  const handleDocumentRemove = (documentId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== documentId));
  };

  const handleSubmitForApproval = async () => {
    const missingRequired = checkMissingRequiredDocuments(ONBOARDING_STAGES, documents);

    if (missingRequired) {
      toast.error('Please upload all required documents before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      await contractorService.onboarding.submitForApproval(contractorId);
      toast.success('Submitted for approval successfully');
      if (onStatusChange) {
        onStatusChange('pending_approval');
      }
    } catch (error: any) {
      console.error('Failed to submit for approval:', error);
      toast.error(error.message || 'Failed to submit for approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    documents,
    isLoading,
    expandedStages,
    overallProgress,
    isSubmitting,
    toggleStageExpansion,
    handleDocumentUpload,
    handleDocumentRemove,
    handleSubmitForApproval
  };
}