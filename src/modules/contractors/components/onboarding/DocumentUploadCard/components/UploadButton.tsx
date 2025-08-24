/**
 * Upload Button Component
 * File input and upload button with progress indication
 */

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { ContractorDocument } from '@/types/contractor.types';

interface UploadButtonProps {
  isUploading: boolean;
  uploadProgress: number;
  currentDocument?: ContractorDocument;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadButton({ 
  isUploading, 
  uploadProgress, 
  currentDocument, 
  onFileSelect 
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={onFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isUploading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : currentDocument
            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
            <span>Uploading... {uploadProgress}%</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>{currentDocument ? 'Replace Document' : 'Upload Document'}</span>
          </>
        )}
      </button>
    </div>
  );
}