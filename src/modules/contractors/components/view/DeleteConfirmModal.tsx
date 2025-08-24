/**
 * Delete Confirm Modal Component
 * Confirmation modal for contractor deletion
 */


interface DeleteConfirmModalProps {
  contractorName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  contractorName,
  isDeleting,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delete Contractor?
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{contractorName}"? This action cannot be undone and will remove all associated data.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Contractor'}
          </button>
        </div>
      </div>
    </div>
  );
}