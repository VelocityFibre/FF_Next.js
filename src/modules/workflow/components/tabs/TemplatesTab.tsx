// 🟢 WORKING: Templates tab component for workflow portal
import React from 'react';
import { TemplateList } from '../templates/TemplateList';
import type { WorkflowTemplate } from '../../types/workflow.types';
import { log } from '@/lib/logger';

interface TemplatesTabProps {
  onTemplateEdit?: (templateId: string) => void;
}

export function TemplatesTab({ onTemplateEdit }: TemplatesTabProps) {
  const handleTemplateSelect = (template: WorkflowTemplate) => {
    log.info('Template selected:', { data: template.name }, 'TemplatesTab');
    // TODO: Handle template selection for preview/details
  };

  const handleTemplateEdit = (templateId: string) => {
    log.info('Edit template:', { data: templateId }, 'TemplatesTab');
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