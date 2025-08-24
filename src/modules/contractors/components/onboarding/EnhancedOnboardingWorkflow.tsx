/**
 * EnhancedOnboardingWorkflow Component - Improved contractor onboarding with document uploads
 * Manages the complete onboarding process with file uploads and approval tracking
 */

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  EnhancedOnboardingWorkflowProps,
  ONBOARDING_STAGES,
  OnboardingHeader,
  OnboardingInstructions,
  OnboardingStageCard,
  useOnboardingWorkflow
} from './EnhancedOnboardingWorkflow/index';

export function EnhancedOnboardingWorkflow({
  contractorId,
  contractorName,
  onStatusChange
}: EnhancedOnboardingWorkflowProps) {
  const {
    documents,
    isLoading,
    expandedStages,
    overallProgress,
    isSubmitting,
    toggleStageExpansion,
    handleDocumentUpload,
    handleDocumentRemove,
    handleSubmitForApproval
  } = useOnboardingWorkflow(contractorId, onStatusChange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" label="Loading onboarding status..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OnboardingHeader
        contractorName={contractorName}
        overallProgress={overallProgress}
        isSubmitting={isSubmitting}
        onSubmitForApproval={handleSubmitForApproval}
      />

      {/* Onboarding Stages */}
      <div className="space-y-4">
        {ONBOARDING_STAGES.map((stage) => (
          <OnboardingStageCard
            key={stage.id}
            stage={stage}
            documents={documents}
            contractorId={contractorId}
            isExpanded={expandedStages.includes(stage.id)}
            onToggleExpansion={toggleStageExpansion}
            onDocumentUpload={handleDocumentUpload}
            onDocumentRemove={handleDocumentRemove}
          />
        ))}
      </div>

      <OnboardingInstructions />
    </div>
  );
}