/**
 * Document Status Component
 * Displays document verification status with icons
 */

import { Check, X, Clock } from 'lucide-react';
import { ContractorDocument } from '@/types/contractor.types';
import { getStatusText } from '../utils/documentUtils';

interface DocumentStatusProps {
  currentDocument?: ContractorDocument;
}

export function DocumentStatus({ currentDocument }: DocumentStatusProps) {
  const getStatusIcon = () => {
    if (!currentDocument) return null;
    
    switch (currentDocument.verificationStatus) {
      case 'verified':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusIcon()}
      <span className={`text-sm font-medium ${
        currentDocument?.verificationStatus === 'verified' ? 'text-green-600' :
        currentDocument?.verificationStatus === 'pending' ? 'text-yellow-600' :
        currentDocument?.verificationStatus === 'rejected' ? 'text-red-600' :
        'text-gray-500'
      }`}>
        {getStatusText(currentDocument)}
      </span>
    </div>
  );
}