/**
 * Staff Import Advanced Component
 * Modular advanced staff import with comprehensive validation and error handling
 */

import { Upload, Download } from 'lucide-react';
import { useStaffImportAdvanced } from './hooks/useStaffImportAdvanced';
import { FileUploadArea } from './components/FileUploadArea';
import { ImportProgress } from './components/ImportProgress';
import { ImportResults } from './components/ImportResults';

export function StaffImportAdvanced() {
  const {
    selectedFile,
    importing,
    progress,
    importResult,
    overwriteExisting,
    handleFileSelect,
    handleImport,
    downloadTemplate,
    clearFile,
    setOverwriteExisting
  } = useStaffImportAdvanced();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Staff Data</h3>
        <p className="text-sm text-gray-600">
          Upload CSV or Excel files to import staff members. Supports both new records and updates to existing staff.
        </p>
      </div>

      {/* Import Options */}
      <div className="mb-6">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={overwriteExisting}
            onChange={(e) => setOverwriteExisting(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Overwrite existing staff records
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-7">
          When enabled, staff with matching Employee IDs will be updated. When disabled, duplicates will be skipped.
        </p>
      </div>

      <FileUploadArea
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onClearFile={clearFile}
      />

      <ImportProgress progress={progress} />

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </button>

        <button
          onClick={handleImport}
          disabled={!selectedFile || importing}
          className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {importing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import Staff
            </>
          )}
        </button>
      </div>

      {importResult && <ImportResults importResult={importResult} />}
    </div>
  );
}