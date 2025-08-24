/**
 * Import Results Component for Staff Import
 */

import { AlertCircle, CheckCircle } from 'lucide-react';
import { ImportResultsProps } from './StaffImportTypes';

export function ImportResults({ result, onReset }: ImportResultsProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={`p-4 rounded-lg ${
        result.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={`font-medium ${
              result.success ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Import {result.success ? 'Successful' : 'Completed with Errors'}
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>✓ {result.imported} staff members imported successfully</p>
              {result.failed > 0 && (
                <p>✗ {result.failed} rows failed to import</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h4 className="font-medium text-red-900 mb-3">Import Errors</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 p-2 bg-white rounded border border-red-200">
                <span className="font-medium">Row {error.row}:</span> {error.message}
                {error.field && error.field !== 'general' && (
                  <span className="text-red-600"> (Field: {error.field})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imported Staff */}
      {result.staffMembers.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Imported Staff Members</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {result.staffMembers.map((staff) => (
              <div key={staff.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {staff.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{staff.name}</p>
                  <p className="text-xs text-gray-500 truncate">{staff.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Import More Staff
        </button>
        {result.imported > 0 && (
          <button
            onClick={() => window.location.href = '/staff'}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            View Staff List
          </button>
        )}
      </div>
    </div>
  );
}