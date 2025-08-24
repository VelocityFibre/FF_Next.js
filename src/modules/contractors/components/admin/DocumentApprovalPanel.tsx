/**
 * DocumentApprovalPanel Component - Admin interface for document approval
 * Refactored version using split components
 */

import { FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDocumentApproval } from './hooks/useDocumentApproval';
import { DocumentCard, DocumentFilters, RejectionModal } from './components';

interface DocumentApprovalPanelProps {
  contractorId?: string; // Optional - if provided, show only documents for this contractor
  onApprovalComplete?: () => void;
}

export function DocumentApprovalPanel({
  contractorId,
  onApprovalComplete
}: DocumentApprovalPanelProps) {
  const {
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
    handleReject
  } = useDocumentApproval({ contractorId, onApprovalComplete });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" label="Loading documents..." />
      </div>
    );
  }

  const pendingCount = filteredDocuments.filter(d => d.verificationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <DocumentFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onSearchChange={setSearchTerm}
        onStatusChange={setFilterStatus}
        pendingCount={pendingCount}
      />

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {filterStatus === 'pending' 
                ? 'No documents are pending review.' 
                : 'Try adjusting your filters to see more documents.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onApprove={handleApprove}
                onReject={(doc) => {
                  setSelectedDocument(doc);
                  setShowRejectionModal(true);
                }}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedDocument && (
        <RejectionModal
          document={selectedDocument}
          rejectionReason={rejectionReason}
          isProcessing={isProcessing}
          onReasonChange={setRejectionReason}
          onConfirm={handleReject}
          onCancel={() => {
            setShowRejectionModal(false);
            setRejectionReason('');
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
}