/**
 * Advanced Staff Import Component
 * Handles both Excel and CSV files with comprehensive validation and error handling
 */

import { useState, useCallback } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, FileText, Table, X } from 'lucide-react';
import { staffImportService } from '@/services/staff/staffImportService';
import { StaffImportResult, StaffImportError } from '@/types/staff.types';
import toast from 'react-hot-toast';

interface ImportProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  status: 'idle' | 'parsing' | 'importing' | 'completed' | 'error';
}

export function StaffImportAdvanced() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    status: 'idle'
  });
  const [importResult, setImportResult] = useState<StaffImportResult | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(true);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const isValidType = allowedTypes.includes(file.type) || 
                       file.name.endsWith('.csv') || 
                       file.name.endsWith('.xlsx') || 
                       file.name.endsWith('.xls');

    if (!isValidType) {
      toast.error('Please select a valid CSV or Excel file');
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
    setProgress({
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      status: 'idle'
    });
  }, []);

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setImporting(true);
    setProgress(prev => ({ ...prev, status: 'parsing' }));

    try {
      let result: StaffImportResult;

      // Determine file type and use appropriate import method
      if (selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv') {
        console.log('📄 Importing CSV file:', selectedFile.name);
        result = await staffImportService.importFromCSV(selectedFile, overwriteExisting);
      } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || 
                 selectedFile.type.includes('spreadsheet') || selectedFile.type.includes('excel')) {
        console.log('📊 Importing Excel file:', selectedFile.name);
        result = await staffImportService.importFromExcel(selectedFile, overwriteExisting);
      } else {
        throw new Error('Unsupported file type. Please use CSV or Excel files.');
      }

      setImportResult(result);
      setProgress({
        total: result.imported + result.failed,
        processed: result.imported + result.failed,
        succeeded: result.imported,
        failed: result.failed,
        status: 'completed'
      });

      if (result.success) {
        toast.success(`Successfully imported ${result.imported} staff members!`);
      } else {
        toast.error(`Import completed with ${result.failed} errors. Check details below.`);
      }

    } catch (error: any) {
      console.error('Import failed:', error);
      setProgress(prev => ({ ...prev, status: 'error' }));
      toast.error(error.message || 'Failed to import staff data');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = staffImportService.getImportTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded successfully');
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    setProgress({
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      status: 'idle'
    });
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv')) return <FileText className="w-5 h-5 text-green-500" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <Table className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'parsing': return 'text-blue-600';
      case 'importing': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

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

      {/* File Upload Area */}
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
              onChange={handleFileSelect}
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
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Status */}
      {progress.status !== 'idle' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium ${getStatusColor(progress.status)}`}>
              {progress.status === 'parsing' && 'Parsing file...'}
              {progress.status === 'importing' && 'Importing staff...'}
              {progress.status === 'completed' && 'Import completed'}
              {progress.status === 'error' && 'Import failed'}
            </span>
            {progress.total > 0 && (
              <span className="text-sm text-gray-600">
                {progress.processed} / {progress.total}
              </span>
            )}
          </div>
          {progress.total > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.processed / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

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

      {/* Import Results */}
      {importResult && (
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
      )}
    </div>
  );
}