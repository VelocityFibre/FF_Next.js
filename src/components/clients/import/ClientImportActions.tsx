/**
 * Import Actions Component for Client Import
 */

import { Download, FileSpreadsheet } from 'lucide-react';
import { ClientImportActionsProps } from './ClientImportTypes';

export function ClientImportActions({ onDownloadTemplate, onExportAll }: ClientImportActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onDownloadTemplate}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Template
      </button>
      <button
        onClick={onExportAll}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export All Clients
      </button>
    </div>
  );
}