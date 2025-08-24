import { ContractorDocument } from '@/types/contractor.types';
import { OnboardingStage, StageStatus } from '../types/onboarding.types';

export const calculateOverallProgress = (
  stages: OnboardingStage[],
  documents: ContractorDocument[]
): number => {
  const totalRequired = stages.reduce((sum, stage) => 
    sum + stage.documents.filter(d => d.required).length, 0
  );
  
  const completedRequired = stages.reduce((sum, stage) => {
    const stageRequiredDocs = stage.documents.filter(d => d.required);
    const completedDocs = stageRequiredDocs.filter(doc => 
      documents.some(d => d.documentType === doc.type && d.verificationStatus === 'verified')
    );
    return sum + completedDocs.length;
  }, 0);

  return totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;
};

export const getStageProgress = (
  stage: OnboardingStage, 
  documents: ContractorDocument[]
): number => {
  const stageDocs = stage.documents.filter(d => d.required);
  if (stageDocs.length === 0) return 100;
  
  const completedDocs = stageDocs.filter(doc =>
    documents.some(d => d.documentType === doc.type && d.verificationStatus === 'verified')
  );
  
  return Math.round((completedDocs.length / stageDocs.length) * 100);
};

export const getStageStatus = (
  stage: OnboardingStage, 
  documents: ContractorDocument[]
): StageStatus => {
  const progress = getStageProgress(stage, documents);
  const hasRejected = stage.documents.some(doc =>
    documents.some(d => d.documentType === doc.type && d.verificationStatus === 'rejected')
  );
  
  if (hasRejected) return 'rejected';
  if (progress === 100) return 'complete';
  if (progress > 0) return 'in_progress';
  return 'pending';
};

export const checkMissingRequiredDocuments = (
  stages: OnboardingStage[],
  documents: ContractorDocument[]
): boolean => {
  return stages.some(stage =>
    stage.documents.some(doc =>
      doc.required && !documents.some(d => d.documentType === doc.type)
    )
  );
};