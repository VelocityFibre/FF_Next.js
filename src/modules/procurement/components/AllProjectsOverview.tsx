import { 
  Building2, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Clock,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import type { 
  AggregateProjectMetrics, 
  ProjectSummary 
} from '@/types/procurement/portal.types';

interface AllProjectsOverviewProps {
  aggregateMetrics: AggregateProjectMetrics | undefined;
  projectSummaries: ProjectSummary[] | undefined;
  navigate: (path: string) => void;
}

export function AllProjectsOverview({ 
  aggregateMetrics, 
  projectSummaries,
  navigate 
}: AllProjectsOverviewProps) {
  
  if (!aggregateMetrics || !projectSummaries) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">All Projects Overview</h1>
        </div>
        <p className="text-gray-600">
          Organization-wide procurement insights across {aggregateMetrics.totalProjects} active projects
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Projects</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{aggregateMetrics.totalProjects}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total BOQ Value</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            R {aggregateMetrics.totalBOQValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Avg Cost Savings</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{aggregateMetrics.averageCostSavings}%</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Avg Cycle Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{aggregateMetrics.averageCycleDays} days</div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Operations</h3>
            <Package className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active RFQs</span>
              <span className="font-semibold">{aggregateMetrics.totalActiveRFQs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Purchase Orders</span>
              <span className="font-semibold">{aggregateMetrics.totalPurchaseOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stock Items</span>
              <span className="font-semibold">{aggregateMetrics.totalStockItems.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Supplier Performance</h3>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Suppliers</span>
              <span className="font-semibold">{aggregateMetrics.totalSuppliers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average OTIF</span>
              <span className="font-semibold text-green-600">{aggregateMetrics.averageSupplierOTIF}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Performance Issues</span>
              <span className="font-semibold text-red-600">2</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alerts & Actions</h3>
            <AlertTriangle className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Critical Alerts</span>
              <span className="font-semibold text-red-600">{aggregateMetrics.criticalAlerts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending Approvals</span>
              <span className="font-semibold text-yellow-600">{aggregateMetrics.pendingApprovals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed Today</span>
              <span className="font-semibold text-green-600">24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Summaries */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Project Summaries</h2>
          <Button
            variant="outline"
            onClick={() => navigate('/app/projects')}
          >
            View All Projects
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BOQ Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active RFQs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectSummaries.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">{project.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R {project.boqValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.activeRFQs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{project.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                    {project.alertCount > 0 && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {project.alertCount} alerts
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.lastActivity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization-Wide Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/app/procurement/reports')}
            className="flex items-center gap-2 h-auto p-4"
          >
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Generate Reports</div>
              <div className="text-sm text-gray-500">Cross-project analytics</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/app/procurement/suppliers')}
            className="flex items-center gap-2 h-auto p-4"
          >
            <Users className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Supplier Management</div>
              <div className="text-sm text-gray-500">Performance tracking</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/app/procurement/stock')}
            className="flex items-center gap-2 h-auto p-4"
          >
            <Package className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <div className="font-medium">Stock Overview</div>
              <div className="text-sm text-gray-500">Inventory across sites</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/app/analytics')}
            className="flex items-center gap-2 h-auto p-4"
          >
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <div className="text-left">
              <div className="font-medium">Advanced Analytics</div>
              <div className="text-sm text-gray-500">Predictive insights</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}