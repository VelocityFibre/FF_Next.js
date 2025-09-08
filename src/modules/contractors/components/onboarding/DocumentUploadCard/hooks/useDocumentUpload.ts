/**
 * Document Upload Hook
 * Custom hook for document upload operations and state management
 */

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { storage } from '@/src/config/firebase';
import { contractorService } from '@/services/contractorService';
import { DocumentType, ContractorDocument } from '@/types/contractor.types';
import { DOCUMENT_TYPE_LABELS } from '../types/documentUpload.types';
import { validateUploadFile } from '../utils/documentUtils';
import { log } from '@/lib/logger';

export function useDocumentUpload(
  contractorId: string,
  documentType: DocumentType,
  documentTitle: string,
  onUploadComplete?: (document: ContractorDocument) => void,
  onDocumentRemove?: (documentId: string) => void
) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create storage reference
      const timestamp = Date.now();
      const fileName = `contractors/${contractorId}/${documentType}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      setUploadProgress(50);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadProgress(75);

      // Save document metadata to Firestore
      const documentData = {
        documentType,
        documentName: documentTitle || DOCUMENT_TYPE_LABELS[documentType],
        fileName: file.name,
        fileUrl: downloadURL,
        fileSize: file.size,
        mimeType: file.type,
        issueDate: new Date(),
        notes: `Uploaded for ${DOCUMENT_TYPE_LABELS[documentType]}`
      };

      const documentId = await contractorService.documents.uploadDocument(contractorId, documentData);
      setUploadProgress(100);

      // Get the created document
      const newDocument = await contractorService.documents.getDocumentById(documentId);
      
      if (newDocument && onUploadComplete) {
        onUploadComplete(newDocument);
      }

      toast.success('Document uploaded successfully');
    } catch (error: any) {
      log.error('Upload error:', { data: error }, 'useDocumentUpload');
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveDocument = async (currentDocument: ContractorDocument) => {
    if (!window.confirm('Are you sure you want to remove this document?')) {
      return;
    }

    try {
      await contractorService.documents.deleteDocument(currentDocument.id);
      if (onDocumentRemove) {
        onDocumentRemove(currentDocument.id);
      }
      toast.success('Document removed successfully');
    } catch (error: any) {
      log.error('Remove error:', { data: error }, 'useDocumentUpload');
      toast.error(error.message || 'Failed to remove document');
    }
  };

  const handleViewDocument = (currentDocument: ContractorDocument) => {
    if (currentDocument.fileUrl) {
      window.open(currentDocument.fileUrl, '_blank');
    }
  };

  const handleDownloadDocument = (currentDocument: ContractorDocument) => {
    if (currentDocument.fileUrl) {
      const link = document.createElement('a');
      link.href = currentDocument.fileUrl;
      link.download = currentDocument.fileName;
      link.click();
    }
  };

  return {
    isUploading,
    uploadProgress,
    handleFileSelect,
    handleRemoveDocument,
    handleViewDocument,
    handleDownloadDocument
  };
}