import { DocumentWithContractor } from '../hooks/useDocumentApproval';
import { DOCUMENT_TYPE_LABELS } from '../utils/documentHelpers';

interface RejectionModalProps {
  document: DocumentWithContractor;
  rejectionReason: string;
  isProcessing: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RejectionModal({
  document,
  rejectionReason,
  isProcessing,
  onReasonChange,
  onConfirm,
  onCancel
}: RejectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Document</h3>
        <p className="text-gray-600 mb-4">
          Please provide a reason for rejecting the {DOCUMENT_TYPE_LABELS[document.documentType]} document.
        </p>
        <textarea
          value={rejectionReason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
        />
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || !rejectionReason.trim()}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Reject Document'}
          </button>
        </div>
      </div>
    </div>
  );
}