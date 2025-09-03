import { useClientSummary } from '@/hooks/useClients';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export function ClientAnalytics() {
  const { data: summary, isLoading, error } = useClientSummary();

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
        <p className="text-red-600">Failed to load client analytics</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Analytics</h2>
        <p className="text-gray-600">Comprehensive overview of your client portfolio performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            {summary.monthlyGrowth > 0 ? (
              <span className="flex items-center text-sm font-medium text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {formatPercentage(summary.monthlyGrowth)}
              </span>
            ) : (
              <span className="flex items-center text-sm font-medium text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                {formatPercentage(Math.abs(summary.monthlyGrowth))}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Clients</p>
          <p className="text-3xl font-bold text-gray-900">{summary.totalClients}</p>
          <p className="text-xs text-gray-500 mt-2">
            {summary.activeClients} active • {summary.prospectClients} prospects
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalProjectValue)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Avg: {formatCurrency(summary.averageProjectValue)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatPercentage(summary.conversionRate)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Prospect to active client
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Active Rate</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatPercentage(summary.activeClients / summary.totalClients)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {summary.activeClients} of {summary.totalClients} clients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(summary.clientsByStatus).map(([status, count]) => {
              const percentage = (count / summary.totalClients) * 100;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'active' ? 'bg-green-500' :
                        status === 'prospect' ? 'bg-blue-500' :
                        status === 'inactive' ? 'bg-gray-500' :
                        status === 'suspended' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(summary.clientsByCategory).map(([category, count]) => {
              const percentage = (count / summary.totalClients) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {category.replace('_', ' ')}
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

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Priority Levels</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(summary.clientsByPriority).map(([priority, count]) => {
              const percentage = (count / summary.totalClients) * 100;
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {priority}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        priority === 'vip' ? 'bg-purple-500' :
                        priority === 'critical' ? 'bg-red-500' :
                        priority === 'high' ? 'bg-orange-500' :
                        priority === 'medium' ? 'bg-yellow-500' :
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

      {/* Top Clients by Value */}
      {summary.topClientsByValue && summary.topClientsByValue.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Project Value</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Client
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Category
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Projects
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Total Value
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Avg Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.topClientsByValue.slice(0, 5).map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.contactPerson}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-600 capitalize">
                        {client.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{client.activeProjects}</span>
                        <span className="text-gray-500"> active / </span>
                        <span className="text-gray-600">{client.totalProjects}</span>
                        <span className="text-gray-500"> total</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(client.totalProjectValue)}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <p className="text-sm text-gray-600">
                        {formatCurrency(client.averageProjectValue)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}