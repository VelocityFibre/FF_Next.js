/**
 * Document Info Component
 * Displays current document information and metadata
 */

import { Eye, Download, Trash2, AlertCircle } from 'lucide-react';
import { ContractorDocument } from '@/types/contractor.types';

interface DocumentInfoProps {
  currentDocument: ContractorDocument;
  onViewDocument: () => void;
  onDownloadDocument: () => void;
  onRemoveDocument: () => void;
}

export function DocumentInfo({ 
  currentDocument, 
  onViewDocument, 
  onDownloadDocument, 
  onRemoveDocument 
}: DocumentInfoProps) {
  return (
    <div className="mb-3 p-3 bg-white rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">{currentDocument.fileName}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-gray-500">
              Uploaded: {new Date(currentDocument.createdAt).toLocaleDateString()}
            </span>
            {currentDocument.expiryDate && (
              <span className={`text-xs ${
                currentDocument.isExpired ? 'text-red-600' : 'text-gray-500'
              }`}>
                Expires: {new Date(currentDocument.expiryDate).toLocaleDateString()}
                {currentDocument.isExpired && ' (EXPIRED)'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onViewDocument}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View Document"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onDownloadDocument}
            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
            title="Download Document"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onRemoveDocument}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            title="Remove Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rejection Reason */}
      {currentDocument.verificationStatus === 'rejected' && currentDocument.rejectionReason && (
        <div className="mt-2 p-2 bg-red-50 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{currentDocument.rejectionReason}</p>
        </div>
      )}

      {/* Verified By Info */}
      {currentDocument.verificationStatus === 'verified' && currentDocument.verifiedBy && (
        <div className="mt-2 text-xs text-green-600">
          Approved by {currentDocument.verifiedBy} on {
            currentDocument.verifiedAt ? new Date(currentDocument.verifiedAt).toLocaleDateString() : 'N/A'
          }
        </div>
      )}
    </div>
  );
}