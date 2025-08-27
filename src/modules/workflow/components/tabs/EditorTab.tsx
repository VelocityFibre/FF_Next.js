// 🟢 WORKING: Visual workflow editor tab component
// React import removed - using JSX without React in scope
import { WorkflowEditorProvider } from '../../context/WorkflowEditorContext';
import { WorkflowEditor } from '../editor';

export function EditorTab() {
  return (
    <WorkflowEditorProvider>
      <div className="h-full">
        <WorkflowEditor />
      </div>
    </WorkflowEditorProvider>
  );
}