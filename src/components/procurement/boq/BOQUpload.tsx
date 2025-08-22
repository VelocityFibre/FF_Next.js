/**
 * BOQ Upload Component
 * Handles Excel/CSV file upload with drag-drop interface and progress tracking
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { validateFile } from '@/lib/utils/excelParser';
import { boqImportService, ImportJob, ImportConfig } from '@/services/procurement/boqImportService';
import { useProcurementContext } from '@/hooks/procurement/useProcurementContext';
import toast from 'react-hot-toast';

interface BOQUploadProps {
  onUploadComplete?: (result: { boqId: string; itemsCreated: number; exceptionsCreated: number }) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

interface UploadState {
  file: File | null;
  job: ImportJob | null;
  isUploading: boolean;
  progress: number;
  stage: string;
  message: string;
  config: Partial<ImportConfig>;
}

const INITIAL_STATE: UploadState = {
  file: null,
  job: null,
  isUploading: false,
  progress: 0,
  stage: '',
  message: '',
  config: {
    autoApprove: false,
    strictValidation: false,
    minMappingConfidence: 0.8,
    createNewItems: false,
    duplicateHandling: 'skip'
  }
};

export default function BOQUpload({ onUploadComplete, onUploadError, className }: BOQUploadProps) {
  const { context } = useProcurementContext();
  const [state, setState] = useState<UploadState>(INITIAL_STATE);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validation = validateFile(file);

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      onUploadError?.(validation.error || 'Invalid file');
      return;
    }

    setState(prev => ({ ...prev, file }));
  }, [onUploadError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: state.isUploading
  });

  const handleConfigChange = (key: keyof ImportConfig, value: any) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const startUpload = async () => {
    if (!state.file || !context) {
      toast.error('Please select a file and ensure project context is available');
      return;
    }

    setState(prev => ({ ...prev, isUploading: true, progress: 0, stage: 'Starting...', message: '' }));

    try {
      const jobId = await boqImportService.startImport(
        state.file,
        context,
        state.config,
        (job, stage, progress, message) => {
          setState(prev => ({
            ...prev,
            job,
            progress,
            stage: stage.charAt(0).toUpperCase() + stage.slice(1),
            message: message || ''
          }));

          // Animate progress bar
          if (progressRef.current) {
            progressRef.current.style.width = `${progress}%`;
          }

          // Handle completion
          if (job.status === 'completed' && job.result) {
            setTimeout(() => {
              toast.success(`BOQ imported successfully! ${job.result!.itemsCreated} items created`);
              onUploadComplete?.(job.result!);
              setState(INITIAL_STATE);
            }, 500);
          } else if (job.status === 'failed') {
            toast.error(`Import failed: ${job.error}`);
            onUploadError?.(job.error || 'Import failed');
          }
        }
      );

      // Update state with job ID
      setState(prev => ({ ...prev, job: { ...prev.job!, id: jobId } }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
      setState(prev => ({ ...prev, isUploading: false }));
    }
  };

  const cancelUpload = () => {
    if (state.job?.id) {
      boqImportService.cancelJob(state.job.id);
      toast.info('Import cancelled');
    }
    setState(INITIAL_STATE);
  };

  const removeFile = () => {
    setState(prev => ({ ...prev, file: null }));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressColor = () => {
    if (state.job?.status === 'failed') return 'bg-red-500';
    if (state.job?.status === 'completed') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (!state.job) return null;
    
    switch (state.job.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-gray-600" />;
      default:
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${state.isUploading ? 'pointer-events-none opacity-50' : 'hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        
        {!state.file ? (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your BOQ file here' : 'Upload BOQ File'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop your Excel (.xlsx, .xls) or CSV file here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Maximum file size: 50MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {getFileIcon(state.file.name)}
              <div className="text-left">
                <p className="font-medium text-gray-900">{state.file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(state.file.size)}</p>
              </div>
              {!state.isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Configuration */}
      {state.file && !state.isUploading && (
        <div className="border rounded-lg p-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-gray-900">Import Configuration</span>
            <span className="text-sm text-gray-500">
              {showAdvanced ? 'Hide' : 'Show'} advanced options
            </span>
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={state.config.autoApprove}
                      onChange={(e) => handleConfigChange('autoApprove', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Auto-approve if high confidence</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={state.config.strictValidation}
                      onChange={(e) => handleConfigChange('strictValidation', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Strict validation mode</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={state.config.createNewItems}
                      onChange={(e) => handleConfigChange('createNewItems', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Create new catalog items</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum mapping confidence
                  </label>
                  <select
                    value={state.config.minMappingConfidence}
                    onChange={(e) => handleConfigChange('minMappingConfidence', parseFloat(e.target.value))}
                    className="w-full rounded-md border-gray-300 text-sm"
                  >
                    <option value={0.6}>60% (Lenient)</option>
                    <option value={0.7}>70% (Standard)</option>
                    <option value={0.8}>80% (Recommended)</option>
                    <option value={0.9}>90% (Strict)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duplicate handling
                  </label>
                  <select
                    value={state.config.duplicateHandling}
                    onChange={(e) => handleConfigChange('duplicateHandling', e.target.value)}
                    className="w-full rounded-md border-gray-300 text-sm"
                  >
                    <option value="skip">Skip duplicates</option>
                    <option value="update">Update existing</option>
                    <option value="create_new">Create new entries</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Display */}
      {state.isUploading && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium text-gray-900">{state.stage}</span>
            </div>
            <span className="text-sm text-gray-500">{Math.round(state.progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              ref={progressRef}
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${state.progress}%` }}
            />
          </div>
          
          {state.message && (
            <p className="text-sm text-gray-600">{state.message}</p>
          )}
          
          {state.job && (
            <div className="text-xs text-gray-500 space-y-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>Total: {state.job.metadata.totalRows}</div>
                <div>Processed: {state.job.metadata.processedRows}</div>
                <div>Valid: {state.job.metadata.validRows}</div>
                <div>Auto-mapped: {state.job.metadata.autoMappedItems}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {state.isUploading ? (
          <button
            onClick={cancelUpload}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        ) : (
          <>
            {state.file && (
              <button
                onClick={removeFile}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
            <button
              onClick={startUpload}
              disabled={!state.file || !context}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Import
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-2">
        <p><strong>Supported formats:</strong> Excel (.xlsx, .xls) and CSV files</p>
        <p><strong>Expected columns:</strong> Line Number, Description, UOM, Quantity (required), Item Code, Phase, Task, Site (optional)</p>
        <p><strong>Auto-mapping:</strong> The system will automatically match items to the catalog based on description and item codes</p>
        <p><strong>Exceptions:</strong> Items that cannot be auto-mapped will be queued for manual review</p>
      </div>
    </div>
  );
}