/**
 * Document Upload Utilities
 * Helper functions for document validation and processing
 */

import { ContractorDocument } from '@/types/contractor.types';

export const getStatusColor = (currentDocument?: ContractorDocument): string => {
  if (!currentDocument) return 'border-gray-300 bg-gray-50';
  
  switch (currentDocument.verificationStatus) {
    case 'verified':
      return 'border-green-500 bg-green-50';
    case 'pending':
      return 'border-yellow-500 bg-yellow-50';
    case 'rejected':
      return 'border-red-500 bg-red-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

export const getStatusText = (currentDocument?: ContractorDocument): string => {
  if (!currentDocument) return 'Not Uploaded';
  
  switch (currentDocument.verificationStatus) {
    case 'verified':
      return 'Approved';
    case 'pending':
      return 'Pending Approval';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

export const validateUploadFile = (file: File): { valid: boolean; error?: string } => {
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a PDF, Image (JPG/PNG), or Word document' };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};