// 🟡 PARTIAL: Workflow editor forms - placeholder for CRUD operations
import { useWorkflowEditor } from '../../../context/WorkflowEditorContext';

export function WorkflowEditorForms() {
  const { state, stopEditingItem } = useWorkflowEditor();

  // TODO: Implement proper forms for creating/editing phases, steps, and tasks
  // This is a placeholder component that will be expanded in future iterations

  if (!state.editingItem) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {state.editingItem.id ? 'Edit' : 'Create'} {state.editingItem.type}
          </h2>
          
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚧</div>
            <p className="text-gray-600 dark:text-gray-400">
              Form implementation coming soon...
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={stopEditingItem}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={stopEditingItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowEditorForms;