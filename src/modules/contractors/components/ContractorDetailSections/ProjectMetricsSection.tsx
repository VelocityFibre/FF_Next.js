/**
 * Project Metrics Section
 * Project statistics and completion rates
 */

import { BarChart3 } from 'lucide-react';
import { ContractorSectionProps } from './types';

export function ProjectMetricsSection({ contractor }: ContractorSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Statistics</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-900">{contractor.totalProjects || 0}</p>
          <p className="text-sm text-blue-700">Total Projects</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-900">{contractor.completedProjects || 0}</p>
          <p className="text-sm text-green-700">Completed</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-2xl font-bold text-orange-900">{contractor.activeProjects || 0}</p>
          <p className="text-sm text-orange-700">Active</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Success Rate</span>
          <span className="text-sm text-gray-900">
            {contractor.successRate ? `${contractor.successRate}%` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">On-Time Completion</span>
          <span className="text-sm text-gray-900">
            {contractor.onTimeCompletion ? `${contractor.onTimeCompletion}%` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Average Project Value</span>
          <span className="text-sm text-gray-900">
            {contractor.averageProjectValue 
              ? `R ${contractor.averageProjectValue.toLocaleString()}` 
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}