import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject, useDeleteProject } from '../../hooks/useProjects';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth.types';

import { ProjectHeader } from './ProjectHeader';
import { ProjectTabs } from './ProjectTabs';
import { ProjectOverview } from './ProjectOverview';
import { ProjectTeam } from './ProjectTeam';
import { ProjectDocuments } from './ProjectDocuments';
import { ProjectProgress } from './ProjectProgress';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export function ProjectDetail() {
  const { id: projectId } = useParams();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { data: project, isLoading, error } = useProject(projectId || '');
  const deleteProject = useDeleteProject();

  const handleEdit = () => {
    window.location.href = `/app/projects/${projectId}/edit`;
  };

  const handleDelete = async () => {
    if (!projectId) return;
    
    try {
      await deleteProject.mutateAsync(projectId);
      window.location.href = '/app/projects';
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const calculateDaysRemaining = () => {
    if (!project) return 0;
    const end = new Date(project.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <p className="text-error-700">Failed to load project details</p>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="space-y-6">
      <ProjectHeader 
        project={project}
        hasPermission={hasPermission}
        onEdit={handleEdit}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <ProjectTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <ProjectOverview project={project} daysRemaining={daysRemaining} />
        )}
        {activeTab === 'team' && (
          <ProjectTeam project={project} />
        )}
        {activeTab === 'documents' && (
          <ProjectDocuments project={project} />
        )}
        {activeTab === 'progress' && (
          <ProjectProgress project={project} />
        )}
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          projectName={project.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}