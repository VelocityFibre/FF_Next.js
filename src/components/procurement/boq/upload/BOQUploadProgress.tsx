/**
 * BOQ Upload Progress Component
 */

import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { ImportJob } from '@/services/procurement/boqImportService';

interface BOQUploadProgressProps {
  job: ImportJob | null;
  progress: number;
  stage: string;
  message: string;
  onCancel?: () => void;
}

export function BOQUploadProgress({ 
  job, 
  progress, 
  stage, 
  message, 
  onCancel 
}: BOQUploadProgressProps) {
  const getProgressColor = () => {
    if (job?.status === 'failed') return 'bg-red-500';
    if (job?.status === 'completed') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (!job) return null;
    
    switch (job.status) {
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

  if (!job) return null;

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-gray-900">Import Progress</span>
        </div>
        {(job.status === 'parsing' || job.status === 'mapping' || job.status === 'validating' || job.status === 'processing') && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{stage}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {message && (
          <p className="text-xs text-gray-500">{message}</p>
        )}
      </div>
      
      {job.metadata && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Processed:</span>
            <span className="ml-1 font-medium">{job.metadata.processedRows}</span>
          </div>
          <div>
            <span className="text-gray-500">Valid:</span>
            <span className="ml-1 font-medium text-green-600">{job.metadata.validRows}</span>
          </div>
          <div>
            <span className="text-gray-500">Errors:</span>
            <span className="ml-1 font-medium text-orange-600">{job.metadata.errorRows}</span>
          </div>
        </div>
      )}
      
      {job.status === 'failed' && job.error && (
        <div className="mt-3 p-2 bg-red-50 rounded-md">
          <p className="text-sm text-red-600">{job.error}</p>
        </div>
      )}
      
      {job.status === 'completed' && (
        <div className="mt-3 p-2 bg-green-50 rounded-md">
          <p className="text-sm text-green-600">
            Import completed successfully! {job.metadata.processedRows || 0} items processed.
          </p>
        </div>
      )}
    </div>
  );
}