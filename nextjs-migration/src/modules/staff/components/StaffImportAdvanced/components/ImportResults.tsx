/**
 * Import Results Component
 * Displays import results with success/error details
 */

import { CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { StaffImportResult, StaffImportError } from '@/types/staff.types';

interface ImportResultsProps {
  importResult: StaffImportResult;
}

export function ImportResults({ importResult }: ImportResultsProps) {
  return (
    <div className="mt-6 border-t pt-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h4>
      
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-medium text-green-900">Successful</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{importResult.imported}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="font-medium text-red-900">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{importResult.failed}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-500 mr-2" />
            <span className="font-medium text-blue-900">Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {importResult.imported + importResult.failed}
          </p>
        </div>
      </div>

      {/* Error Details */}
      {importResult.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h5 className="font-medium text-red-900 mb-3">Import Errors:</h5>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {importResult.errors.map((error: StaffImportError, index: number) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-red-800">Row {error.row}:</span>
                <span className="text-red-700 ml-2">{error.message}</span>
                {error.field && (
                  <span className="text-red-600 ml-1">({error.field})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {importResult.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-medium text-green-900">
              All staff members imported successfully!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}