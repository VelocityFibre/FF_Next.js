/**
 * Project Hierarchy View Component
 */

import { ChevronRight } from 'lucide-react';
import { ProjectHierarchy, TaskStatus } from '@/types/project.types';
import { getPhaseStatusIcon } from './ProjectDetailHelpers';

interface ProjectHierarchyViewProps {
  hierarchy: ProjectHierarchy | undefined;
  isLoading: boolean;
}

export function ProjectHierarchyView({ hierarchy, isLoading }: ProjectHierarchyViewProps) {
  const getTaskStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return '✅';
      case TaskStatus.IN_PROGRESS:
        return '🔄';
      case TaskStatus.PENDING:
        return '⏳';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hierarchy || hierarchy.phases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No project hierarchy defined</h3>
        <p className="text-gray-600">
          Break down your project into phases and tasks to track progress better.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hierarchy.phases.map(phase => (
        <div key={phase.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getPhaseStatusIcon(phase.status)}
                <h3 className="ml-3 text-lg font-medium text-gray-900">{phase.name}</h3>
              </div>
              <span className="text-sm text-gray-500">
                {phase.startDate && new Date(phase.startDate).toLocaleDateString()} - 
                {phase.endDate && new Date(phase.endDate).toLocaleDateString()}
              </span>
            </div>
            {phase.description && (
              <p className="mt-2 text-sm text-gray-600">{phase.description}</p>
            )}
          </div>
          
          {phase.tasks && phase.tasks.length > 0 && (
            <div className="p-4">
              <div className="space-y-2">
                {phase.tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="mr-2">{getTaskStatusIcon(task.status)}</span>
                      <span className="text-sm font-medium text-gray-900">{task.name}</span>
                      {task.assignedTo && (
                        <span className="ml-2 text-xs text-gray-500">• {task.assignedTo}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}