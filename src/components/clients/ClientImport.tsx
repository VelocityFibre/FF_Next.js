import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Building2 } from 'lucide-react';
import { clientService } from '@/services/clientService';
import { ClientImportResult } from '@/types/client.types';

export function ClientImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ClientImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid CSV or Excel file');
      return;
    }
    
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    try {
      let result: ClientImportResult;
      
      if (selectedFile.type === 'text/csv') {
        result = await clientService.importFromCSV(selectedFile);
      } else {
        result = await clientService.importFromExcel(selectedFile);
      }
      
      setImportResult(result);
      
      if (result.success) {
        // Optionally refresh client list or navigate
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        imported: 0,
        failed: 1,
        errors: [{
          row: 0,
          field: 'general',
          message: 'Failed to import file. Please check the format and try again.'
        }],
        clients: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = clientService.getImportTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    try {
      const blob = await clientService.exportToExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export client data');
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Import Clients</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>
              <button
                onClick={handleExportAll}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export All Clients
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!selectedFile && !importResult && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
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
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          )}

          {selectedFile && !importResult && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetImport}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Clients
                    </>
                  )}
                </button>
                <button
                  onClick={resetImport}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {importResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className={`p-4 rounded-lg ${
                importResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start gap-3">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      importResult.success ? 'text-green-900' : 'text-yellow-900'
                    }`}>
                      Import {importResult.success ? 'Successful' : 'Completed with Errors'}
                    </h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>✓ {importResult.imported} clients imported successfully</p>
                      {importResult.failed > 0 && (
                        <p>✗ {importResult.failed} rows failed to import</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-900 mb-3">Import Errors</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
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

              {/* Imported Clients */}
              {importResult.clients.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Imported Clients</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {importResult.clients.map((client) => (
                      <div key={client.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                          <p className="text-xs text-gray-500 truncate">{client.contactPerson}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetImport}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Import More Clients
                </button>
                {importResult.imported > 0 && (
                  <button
                    onClick={() => window.location.href = '/clients'}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    View Client List
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!importResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Import Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Download the template to see the required format</li>
                <li>• Required fields: Company Name, Contact Person, Email, and Phone</li>
                <li>• Status options: active, inactive, suspended, prospect, former</li>
                <li>• Category options: enterprise, sme, residential, government, non_profit, education, healthcare</li>
                <li>• Priority options: low, medium, high, critical, vip</li>
                <li>• Payment terms: immediate, net_7, net_14, net_30, net_60, net_90, prepaid</li>
                <li>• Credit rating: excellent, good, fair, poor, unrated</li>
                <li>• Service types should be comma-separated (e.g., ftth, enterprise, maintenance)</li>
                <li>• Tags should be comma-separated for categorization</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}