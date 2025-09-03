/**
 * File Upload Area Component
 * Drag and drop file upload interface
 */

import { Upload, FileText, Table, X } from 'lucide-react';
import { formatFileSize } from '../utils/importUtils';

interface FileUploadAreaProps {
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
}

export function FileUploadArea({ selectedFile, onFileSelect, onClearFile }: FileUploadAreaProps) {
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv')) return <FileText className="w-5 h-5 text-green-500" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <Table className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      {!selectedFile ? (
        <label className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Choose a file to upload</p>
          <p className="text-sm text-gray-600 mb-4">CSV, Excel (.xlsx, .xls) files supported</p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Select File
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={onFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getFileIcon(selectedFile.name)}
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={onClearFile}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}