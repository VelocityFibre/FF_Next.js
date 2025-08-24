/**
 * Project Schedule Card Component
 */

import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { Project } from '@/types/project.types';

interface ProjectScheduleCardProps {
  project: Project;
}

export function ProjectScheduleCard({ project }: ProjectScheduleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Resources</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">Start Date</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">End Date</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">Duration</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {project.startDate && project.endDate
              ? `${Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
              : 'Not set'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="text-sm">Budget</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {project.budget ? `R ${project.budget.toLocaleString()}` : 'Not set'}
          </span>
        </div>
        
        {project.projectManagerName && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">Project Manager</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {project.projectManagerName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}