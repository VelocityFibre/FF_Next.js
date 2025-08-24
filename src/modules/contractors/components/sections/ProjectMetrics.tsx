/**
 * Project Metrics Section
 * Displays project statistics and onboarding progress
 */

import { Users } from 'lucide-react';
import { Contractor } from '@/types/contractor.types';

interface ProjectMetricsProps {
  contractor: Contractor;
}

export function ProjectMetrics({ contractor }: ProjectMetricsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Statistics</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xl font-bold text-blue-600">{contractor.activeProjects}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xl font-bold text-green-600">{contractor.completedProjects}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-gray-600">{contractor.totalProjects}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-xl font-bold text-red-600">{contractor.cancelledProjects}</p>
          <p className="text-sm text-gray-600">Cancelled</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Onboarding Progress</span>
          <span className="text-sm font-bold text-yellow-600">{contractor.onboardingProgress}%</span>
        </div>
        <div className="w-full bg-yellow-200 rounded-full h-2 mt-1">
          <div 
            className="bg-yellow-600 h-2 rounded-full" 
            style={{ width: `${contractor.onboardingProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}