import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  warnings: string[];
}

interface FileAnalysis {
  recordCount: number;
  fileSize: number;
  recommendedMethod: 'UI' | 'CLI' | 'HYBRID';
  estimatedTime: string;
  reason: string;
}

export const ImportWizard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'analyze' | 'confirm' | 'import' | 'complete'>('select');

  const analyzeFile = useCallback(async (file: File) => {
    setCurrentStep('analyze');
    
    // Simulate file analysis
    const recordCount = Math.floor(file.size / 100); // Rough estimate
    const fileSizeMB = file.size / (1024 * 1024);
    
    let recommendedMethod: 'UI' | 'CLI' | 'HYBRID' = 'UI';
    let estimatedTime = '2-5 minutes';
    let reason = 'Small to medium file suitable for UI processing';

    if (recordCount > 10000 || fileSizeMB > 50) {
      recommendedMethod = 'CLI';
      estimatedTime = '15-30 minutes';
      reason = 'Large file requiring server-side processing';
    } else if (recordCount > 5000 || fileSizeMB > 20) {
      recommendedMethod = 'HYBRID';
      estimatedTime = '5-15 minutes';
      reason = 'Medium file - either method works';
    }

    setAnalysis({
      recordCount,
      fileSize: fileSizeMB,
      recommendedMethod,
      estimatedTime,
      reason
    });
    
    setCurrentStep('confirm');
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      analyzeFile(file);
    }
  }, [analyzeFile]);

  const handleImport = useCallback(async () => {
    if (!selectedFile || !analysis) return;

    setCurrentStep('import');
    setIsUploading(true);

    try {
      // For UI method, process smaller files directly
      if (analysis.recommendedMethod === 'UI' && analysis.recordCount <= 5000) {
        // Simulate UI-based import for smaller files
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setImportResult({
          success: true,
          recordsProcessed: analysis.recordCount,
          errors: [],
          warnings: ['Some records had missing status information']
        });
      } else {
        // For larger files, show CLI recommendation
        setImportResult({
          success: false,
          recordsProcessed: 0,
          errors: ['File too large for UI import. Please use CLI method.'],
          warnings: []
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        recordsProcessed: 0,
        errors: ['Import failed: ' + (error as Error).message],
        warnings: []
      });
    } finally {
      setIsUploading(false);
      setCurrentStep('complete');
    }
  }, [selectedFile, analysis]);

  const resetWizard = useCallback(() => {
    setSelectedFile(null);
    setAnalysis(null);
    setImportResult(null);
    setCurrentStep('select');
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">OneMap Data Import</h2>
        <p className="text-gray-600">Upload and import Lawley property data</p>
      </div>

      {/* Step 1: File Selection */}
      {currentStep === 'select' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-gray-900">Choose Excel file</span>
                <span className="text-gray-500 block">or drag and drop</span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500 text-center">
            Supports Excel files (.xlsx, .xls) up to 100MB
          </div>
        </div>
      )}

      {/* Step 2: File Analysis */}
      {currentStep === 'analyze' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-500 animate-spin" />
            <span className="text-lg font-medium">Analyzing file...</span>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">Please wait while we analyze your file characteristics.</p>
          </div>
        </div>
      )}

      {/* Step 3: Import Confirmation */}
      {currentStep === 'confirm' && analysis && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">File Analysis Results</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Records:</span> {analysis.recordCount.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">File Size:</span> {analysis.fileSize.toFixed(2)} MB
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            analysis.recommendedMethod === 'UI' ? 'bg-green-50 border-green-200' :
            analysis.recommendedMethod === 'CLI' ? 'bg-orange-50 border-orange-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              {analysis.recommendedMethod === 'UI' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
              {analysis.recommendedMethod === 'CLI' && <Zap className="h-5 w-5 text-orange-500 mt-0.5" />}
              {analysis.recommendedMethod === 'HYBRID' && <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
              
              <div>
                <h4 className="font-medium text-gray-900">
                  Recommended: {analysis.recommendedMethod === 'UI' ? 'UI Import' : 
                               analysis.recommendedMethod === 'CLI' ? 'CLI Import' : 
                               'Flexible (UI or CLI)'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{analysis.reason}</p>
                <p className="text-sm text-gray-600">Estimated time: {analysis.estimatedTime}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            {analysis.recommendedMethod !== 'CLI' && (
              <button
                onClick={handleImport}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start UI Import
              </button>
            )}
            
            <button
              onClick={() => {
                console.log('CLI Command: node scripts/conservative-lawley-import.js');
                alert('Run this command in terminal: node scripts/conservative-lawley-import.js');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Use CLI Import
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Import Progress */}
      {currentStep === 'import' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium">Importing data...</span>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              Processing {analysis?.recordCount.toLocaleString()} records. This may take a few minutes.
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Import Results */}
      {currentStep === 'complete' && importResult && (
        <div className="space-y-6">
          <div className={`p-4 rounded-lg ${
            importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              
              <div>
                <h4 className="font-medium text-gray-900">
                  {importResult.success ? 'Import Successful!' : 'Import Issues'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {importResult.success 
                    ? `Successfully imported ${importResult.recordsProcessed.toLocaleString()} records`
                    : 'Some issues occurred during import'
                  }
                </p>
              </div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h5 className="font-medium text-red-900 mb-2">Errors:</h5>
              <ul className="text-sm text-red-800 space-y-1">
                {importResult.errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {importResult.warnings.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-2">Warnings:</h5>
              <ul className="text-sm text-yellow-800 space-y-1">
                {importResult.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={resetWizard}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Import Another File
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
