// 🟢 WORKING: Templates tab component for workflow portal
import React from 'react';
import { TemplateList } from '../templates/TemplateList';
import type { WorkflowTemplate } from '../../types/workflow.types';

interface TemplatesTabProps {
  onTemplateEdit?: (templateId: string) => void;
}

export function TemplatesTab({ onTemplateEdit }: TemplatesTabProps) {
  const handleTemplateSelect = (template: WorkflowTemplate) => {
    console.log('Template selected:', template.name);
    // TODO: Handle template selection for preview/details
  };

  const handleTemplateEdit = (templateId: string) => {
    console.log('Edit template:', templateId);
    onTemplateEdit?.(templateId);
    // TODO: Navigate to editor or open edit modal
  };

  return (
    <div className="p-6">
      <TemplateList
        onTemplateSelect={handleTemplateSelect}
        onTemplateEdit={handleTemplateEdit}
      />
    </div>
  );
}