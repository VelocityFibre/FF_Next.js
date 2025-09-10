import { CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SOWFile } from '../types/sowUpload.types';

interface UploadSummaryProps {
  files: SOWFile[];
  allFilesUploaded: boolean;
  onComplete?: () => void;
  showActions: boolean;
}

export function UploadSummary({
  files,
  allFilesUploaded,
  onComplete,
  showActions
}: UploadSummaryProps) {
  if (files.length === 0) return null;

  return (
    <>
      {/* Summary */}
      <div className="bg-[var(--ff-background-secondary)] rounded-lg p-4">
        <h4 className="text-sm font-medium text-[var(--ff-text-primary)] mb-3">Upload Summary</h4>
        <div className="space-y-2">
          {files.map(file => (
            <div key={file.type} className="flex items-center justify-between text-sm">
              <span className="text-[var(--ff-text-secondary)] capitalize">{file.type}:</span>
              <span className={cn(
                "font-medium",
                file.status === 'success' ? "text-success-600" :
                file.status === 'error' ? "text-error-600" :
                file.status === 'processing' ? "text-primary-600" :
                "text-[var(--ff-text-tertiary)]"
              )}>
                {file.status === 'success' && file.data ? `${file.data.length} items` :
                 file.status === 'error' ? 'Failed' :
                 file.status === 'processing' ? 'Processing...' :
                 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Button */}
      {showActions && allFilesUploaded && onComplete && (
        <div className="flex justify-end">
          <button
            onClick={onComplete}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-success-600 rounded-lg hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Continue with SOW Data
          </button>
        </div>
      )}
    </>
  );
}