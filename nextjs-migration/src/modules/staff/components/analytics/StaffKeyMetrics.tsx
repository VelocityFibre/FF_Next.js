/**
 * Staff Key Metrics Component
 * Displays key staff statistics cards (total, available, project load, utilization)
 */

import { 
  Users, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  UserCheck
} from 'lucide-react';

interface StaffKeyMetricsProps {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  availableStaff: number;
  averageProjectLoad?: number;
  monthlyGrowth?: number;
}

export function StaffKeyMetrics({ 
  totalStaff, 
  activeStaff, 
  inactiveStaff, 
  availableStaff, 
  averageProjectLoad,
  monthlyGrowth 
}: StaffKeyMetricsProps) {
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const utilizationRate = (activeStaff - (availableStaff || 0)) / activeStaff;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          {monthlyGrowth && monthlyGrowth > 0 ? (
            <span className="flex items-center text-sm font-medium text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              {formatPercentage(monthlyGrowth)}
            </span>
          ) : monthlyGrowth && monthlyGrowth < 0 ? (
            <span className="flex items-center text-sm font-medium text-red-600">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              {formatPercentage(Math.abs(monthlyGrowth))}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-gray-500 mb-1">Total Staff</p>
        <p className="text-3xl font-bold text-gray-900">{totalStaff}</p>
        <p className="text-xs text-gray-500 mt-2">
          {activeStaff} active • {inactiveStaff} inactive
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-1">Available Staff</p>
        <p className="text-3xl font-bold text-gray-900">{availableStaff}</p>
        <p className="text-xs text-gray-500 mt-2">
          Ready for assignment
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Briefcase className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-1">Avg Project Load</p>
        <p className="text-3xl font-bold text-gray-900">
          {averageProjectLoad?.toFixed(1) || 0}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Projects per staff member
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Award className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-1">Utilization Rate</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatPercentage(utilizationRate)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {availableStaff || 0} staff currently assigned
        </p>
      </div>
    </div>
  );
}