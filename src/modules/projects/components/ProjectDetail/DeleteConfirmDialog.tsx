import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ projectName, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-error-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-error-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Delete Project</h3>
        </div>
        
        <p className="text-neutral-600 mb-6">
          Are you sure you want to delete <strong>{projectName}</strong>? 
          This action cannot be undone and will permanently remove all associated data.
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-error-600 text-white hover:bg-error-700 rounded-lg transition-colors"
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}