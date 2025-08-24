import { 
  Check, 
  X, 
  Eye, 
  Download, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { DocumentWithContractor } from '../hooks/useDocumentApproval';
import { DOCUMENT_TYPE_LABELS, getStatusBadge, viewDocument, downloadDocument } from '../utils/documentHelpers';

interface DocumentCardProps {
  document: DocumentWithContractor;
  onApprove: (document: DocumentWithContractor) => void;
  onReject: (document: DocumentWithContractor) => void;
  isProcessing: boolean;
}

export function DocumentCard({
  document,
  onApprove,
  onReject,
  isProcessing
}: DocumentCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Document Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {DOCUMENT_TYPE_LABELS[document.documentType]}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{document.fileName}</p>
                
                {/* Contractor Info */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{document.contractorName || 'Unknown Contractor'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Uploaded {new Date(document.uploadedAt || document.createdAt).toLocaleDateString()}</span>
                  </div>
                  {document.expiryDate && (
                    <div className={`flex items-center gap-1 text-sm ${
                      document.isExpired ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      <Clock className="w-4 h-4" />
                      <span>
                        Expires {new Date(document.expiryDate).toLocaleDateString()}
                        {document.isExpired && ' (EXPIRED)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Info */}
                <div className="mt-3">
                  {getStatusBadge(document.verificationStatus)}
                  {document.verificationStatus === 'verified' && document.verifiedBy && (
                    <span className="ml-2 text-sm text-gray-500">
                      Approved by {document.verifiedBy} on {
                        document.verifiedAt ? new Date(document.verifiedAt).toLocaleDateString() : 'N/A'
                      }
                    </span>
                  )}
                  {document.verificationStatus === 'rejected' && document.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 rounded flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <p className="text-sm text-red-700">{document.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => viewDocument(document.fileUrl)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="View Document"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => downloadDocument(document.fileUrl, document.fileName)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
              title="Download Document"
            >
              <Download className="w-5 h-5" />
            </button>
            
            {document.verificationStatus === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(document)}
                  disabled={isProcessing}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                  title="Approve Document"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onReject(document)}
                  disabled={isProcessing}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  title="Reject Document"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}