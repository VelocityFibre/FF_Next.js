/**
 * Top Performers Table Component
 * Displays table of top performing staff members with their metrics
 */


interface TopPerformer {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  currentProjectCount: number;
  totalProjectsCompleted: number;
  averageProjectRating?: number;
  onTimeCompletionRate: number;
}

interface TopPerformersTableProps {
  topPerformers: TopPerformer[];
}

export function TopPerformersTable({ topPerformers }: TopPerformersTableProps) {
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (!topPerformers || topPerformers.length === 0) {
    return null;
  }

  return (
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
            {topPerformers.slice(0, 5).map((staff) => (
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
  );
}