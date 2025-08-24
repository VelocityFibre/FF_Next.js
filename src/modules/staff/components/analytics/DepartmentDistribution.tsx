/**
 * Department Distribution Component
 * Displays staff distribution across departments with progress bars
 */

import { PieChart } from 'lucide-react';

interface DepartmentDistributionProps {
  staffByDepartment: Record<string, number>;
  totalStaff: number;
}

export function DepartmentDistribution({ staffByDepartment, totalStaff }: DepartmentDistributionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
        <PieChart className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {Object.entries(staffByDepartment).map(([dept, count]) => {
          const percentage = (count / totalStaff) * 100;
          return (
            <div key={dept}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 capitalize">
                  {dept.replace('_', ' ')}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}