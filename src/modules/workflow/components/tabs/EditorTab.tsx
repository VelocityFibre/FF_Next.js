// 🟢 WORKING: Visual workflow editor tab component
import React from 'react';
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