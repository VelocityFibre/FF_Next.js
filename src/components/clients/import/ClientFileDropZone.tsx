/**
 * File Drop Zone Component for Client Import
 */

import { Upload } from 'lucide-react';
import { ClientFileDropZoneProps } from './ClientImportTypes';

export function ClientFileDropZone({ 
  onFileSelect, 
  dragActive, 
  onDragEnter, 
  onDragLeave, 
  onDragOver, 
  onDrop 
}: ClientFileDropZoneProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid CSV or Excel file');
        return;
      }
      
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-lg font-medium text-gray-900 mb-2">
        Drop your CSV or Excel file here
      </p>
      <p className="text-sm text-gray-500 mb-4">
        or click to browse from your computer
      </p>
      <input
        type="file"
        id="client-file-upload"
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileInput}
      />
      <label
        htmlFor="client-file-upload"
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
      >
        Choose File
      </label>
    </div>
  );
}