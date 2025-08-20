import { useStaffSummary } from '@/hooks/useStaff';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Users, 
  TrendingUp, 
  Award,
  Clock,
  Activity,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { Department, StaffStatus, StaffLevel, ContractType } from '@/types/staff.types';

export function StaffAnalytics() {
  const { data: summary, isLoading, error } = useStaffSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading analytics..." />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Failed to load staff analytics</p>
      </div>
    );
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Analytics</h2>
        <p className="text-gray-600">Comprehensive overview of your workforce performance and allocation</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            {summary.monthlyGrowth && summary.monthlyGrowth > 0 ? (
              <span className="flex items-center text-sm font-medium text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {formatPercentage(summary.monthlyGrowth)}
              </span>
            ) : summary.monthlyGrowth && summary.monthlyGrowth < 0 ? (
              <span className="flex items-center text-sm font-medium text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                {formatPercentage(Math.abs(summary.monthlyGrowth))}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Staff</p>
          <p className="text-3xl font-bold text-gray-900">{summary.totalStaff}</p>
          <p className="text-xs text-gray-500 mt-2">
            {summary.activeStaff} active • {summary.inactiveStaff} inactive
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Available Staff</p>
          <p className="text-3xl font-bold text-gray-900">{summary.availableStaff}</p>
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
            {summary.averageProjectLoad?.toFixed(1) || 0}
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
            {formatPercentage((summary.activeStaff - summary.availableStaff) / summary.activeStaff)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Staff currently assigned
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {summary.staffByDepartment && Object.entries(summary.staffByDepartment).map(([dept, count]) => {
              const percentage = (count / summary.totalStaff) * 100;
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

        {/* Level Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Experience Levels</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {summary.staffByLevel && Object.entries(summary.staffByLevel).map(([level, count]) => {
              const percentage = (count / summary.totalStaff) * 100;
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {level}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        level === 'senior' ? 'bg-purple-500' :
                        level === 'intermediate' ? 'bg-blue-500' :
                        level === 'junior' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contract Types</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {summary.staffByContractType && Object.entries(summary.staffByContractType).map(([type, count]) => {
              const percentage = (count / summary.totalStaff) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        type === 'permanent' ? 'bg-green-500' :
                        type === 'contract' ? 'bg-orange-500' :
                        type === 'temporary' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {summary.topPerformers && summary.topPerformers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Staff Member
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Department
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Position
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Projects
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Rating
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    On-Time %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.topPerformers.slice(0, 5).map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                        <p className="text-xs text-gray-500">{staff.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-600 capitalize">
                        {staff.department.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-600">
                        {staff.position}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{staff.currentProjectCount}</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-gray-600">{staff.totalProjectsCompleted}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-medium text-yellow-600">
                          ⭐ {staff.averageProjectRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-sm font-medium ${
                        staff.onTimeCompletionRate >= 0.9 ? 'text-green-600' :
                        staff.onTimeCompletionRate >= 0.7 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {formatPercentage(staff.onTimeCompletionRate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Skills Overview */}
      {summary.topSkills && summary.topSkills.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills in Workforce</h3>
          <div className="flex flex-wrap gap-2">
            {summary.topSkills.map((skill) => (
              <span
                key={skill.skill}
                className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {skill.skill.replace('_', ' ')} ({skill.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}