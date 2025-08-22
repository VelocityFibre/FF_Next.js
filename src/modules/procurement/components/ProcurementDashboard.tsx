import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Activity, 
  FileSignature, 
  Truck, 
  TrendingUp,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { ProcurementErrorBoundary } from './error/ProcurementErrorBoundary';
import { useProcurementPermissions } from '../hooks/useProcurementPermissions';

interface DashboardCard {
  title: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
  link: string;
  description: string;
  permissions?: string[];
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<any>;
  link: string;
  color: string;
  permissions?: string[];
}

/**
 * Main Procurement Dashboard
 * Provides overview of all procurement activities and quick access to major functions
 * Following FibreFlow Universal Module Structure
 */
export function ProcurementDashboard() {
  // Mock data - will be replaced with real data hooks
  const dashboardCards: DashboardCard[] = [
    {
      title: 'Active BOQs',
      count: 12,
      icon: FileText,
      color: 'blue',
      link: '/app/procurement/boq',
      description: 'Bills of Quantities under review'
    },
    {
      title: 'Open RFQs',
      count: 8,
      icon: FileText,
      color: 'purple',
      link: '/app/procurement/rfq',
      description: 'Requests for Quote awaiting responses'
    },
    {
      title: 'Pending Quotes',
      count: 23,
      icon: BarChart3,
      color: 'orange',
      link: '/app/procurement/quotes',
      description: 'Quotes requiring evaluation'
    },
    {
      title: 'Stock Alerts',
      count: 5,
      icon: Activity,
      color: 'red',
      link: '/app/procurement/stock',
      description: 'Items requiring attention'
    },
    {
      title: 'Purchase Orders',
      count: 18,
      icon: FileSignature,
      color: 'green',
      link: '/app/procurement/orders',
      description: 'Active purchase orders'
    },
    {
      title: 'Active Suppliers',
      count: 45,
      icon: Truck,
      color: 'indigo',
      link: '/app/procurement/suppliers',
      description: 'Registered suppliers'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      label: 'Upload BOQ',
      icon: Plus,
      link: '/app/procurement/boq/upload',
      color: 'blue'
    },
    {
      label: 'Create RFQ',
      icon: Plus,
      link: '/app/procurement/rfq/create',
      color: 'purple'
    },
    {
      label: 'Create Order',
      icon: Plus,
      link: '/app/procurement/orders/create',
      color: 'green'
    },
    {
      label: 'View Reports',
      icon: TrendingUp,
      link: '/app/procurement/reports',
      color: 'orange'
    }
  ];

  // Mock recent activities - will be replaced with real data
  const recentActivities = [
    {
      id: '1',
      type: 'BOQ',
      action: 'uploaded',
      item: 'Project Alpha BOQ v2.1',
      timestamp: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'RFQ',
      action: 'issued',
      item: 'RFQ-2024-001 - Fiber Cables',
      timestamp: '4 hours ago',
      status: 'info'
    },
    {
      id: '3',
      type: 'Quote',
      action: 'received',
      item: 'Quote from TechSupply Co.',
      timestamp: '6 hours ago',
      status: 'warning'
    },
    {
      id: '4',
      type: 'Stock',
      action: 'low stock alert',
      item: 'Single Mode Fiber Cable',
      timestamp: '1 day ago',
      status: 'error'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500 border-blue-500 text-blue-600',
      purple: 'bg-purple-500 border-purple-500 text-purple-600',
      orange: 'bg-orange-500 border-orange-500 text-orange-600',
      red: 'bg-red-500 border-red-500 text-red-600',
      green: 'bg-green-500 border-green-500 text-green-600',
      indigo: 'bg-indigo-500 border-indigo-500 text-indigo-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <ProcurementErrorBoundary level="page">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Procurement Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your procurement processes and track progress</p>
          </div>
          <div className="flex space-x-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorClasses = getColorClasses(action.color);
              return (
                <Link
                  key={action.label}
                  to={action.link}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${action.color}-600 hover:bg-${action.color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${action.color}-500`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            const colorClasses = getColorClasses(card.color);
            
            return (
              <Link
                key={card.title}
                to={card.link}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-md bg-${card.color}-100`}>
                        <Icon className={`h-6 w-6 text-${card.color}-600`} />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.title}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {card.count}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activities and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.type}</span> {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{activity.item}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  to="/app/procurement/reports"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all activities →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month's Spending</span>
                  <span className="text-lg font-semibold text-gray-900">R 2,450,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Quote Response</span>
                  <span className="text-lg font-semibold text-gray-900">3.2 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Supplier Performance</span>
                  <span className="text-lg font-semibold text-green-600">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cost Savings (YTD)</span>
                  <span className="text-lg font-semibold text-green-600">R 345,000</span>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/app/procurement/reports/cost-analysis"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View detailed analytics →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Module Structure Complete
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  The procurement module structure and navigation are now ready. 
                  Individual components will be implemented in subsequent phases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProcurementErrorBoundary>
  );
}