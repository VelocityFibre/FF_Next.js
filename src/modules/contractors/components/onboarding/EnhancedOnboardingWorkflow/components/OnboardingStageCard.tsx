import { CheckCircle, Clock, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { ContractorDocument } from '@/types/contractor.types';
import { OnboardingStage, StageStatus } from '../types/onboarding.types';
import { getStageProgress, getStageStatus } from '../utils/progressUtils';
import { DocumentUploadCard } from '../../DocumentUploadCard';

interface OnboardingStageCardProps {
  stage: OnboardingStage;
  documents: ContractorDocument[];
  contractorId: string;
  isExpanded: boolean;
  onToggleExpansion: (stageId: string) => void;
  onDocumentUpload: (document: ContractorDocument) => void;
  onDocumentRemove: (documentId: string) => void;
}

const getStageStatusIcon = (status: StageStatus) => {
  switch (status) {
    case 'complete':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'in_progress':
      return <Clock className="w-5 h-5 text-yellow-600" />;
    case 'rejected':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

export function OnboardingStageCard({
  stage,
  documents,
  contractorId,
  isExpanded,
  onToggleExpansion,
  onDocumentUpload,
  onDocumentRemove
}: OnboardingStageCardProps) {
  const stageStatus = getStageStatus(stage, documents);
  const stageProgress = getStageProgress(stage, documents);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Stage Header */}
      <button
        onClick={() => onToggleExpansion(stage.id)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${
            stageStatus === 'complete' ? 'bg-green-100 text-green-600' :
            stageStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
            stageStatus === 'rejected' ? 'bg-red-100 text-red-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {stage.icon}
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">{stage.title}</h3>
            <p className="text-sm text-gray-600">{stage.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStageStatusIcon(stageStatus)}
            <span className="text-sm font-medium text-gray-700">
              {stageProgress}% Complete
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Stage Documents */}
      {isExpanded && (
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
          {stage.documents.map((doc) => {
            const currentDoc = documents.find(d => d.documentType === doc.type);
            return (
              <DocumentUploadCard
                key={doc.type}
                contractorId={contractorId}
                documentType={doc.type}
                documentTitle={doc.title}
                description={doc.description}
                required={doc.required}
                currentDocument={currentDoc}
                onUploadComplete={onDocumentUpload}
                onDocumentRemove={onDocumentRemove}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}