import { useState, useCallback } from 'react';
import { 
  FolderOpen, 
  Building2, 
  Users, 
  UserCheck, 
  FileText, 
  Truck,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { notificationService } from '@/services/core';
import '../styles/design-system.css';

interface StatCardData {
  title: string;
  subtitle: string;
  value: string | number;
  subValue: string;
  icon: any;
  color: string;
  route?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      notificationService.success('Dashboard data refreshed successfully');
    } catch (error) {
      notificationService.error('Failed to refresh dashboard data');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleExport = useCallback(() => {
    notificationService.info('Export functionality coming soon');
  }, []);

  const statCards: StatCardData[] = [
    {
      title: 'Projects',
      subtitle: 'Manage and track all projects',
      value: 4,
      subValue: 'Total Projects',
      icon: FolderOpen,
      color: '#3b82f6',
      route: '/app/projects'
    },
    {
      title: 'Suppliers',
      subtitle: 'Supplier management and contacts',
      value: 1,
      subValue: 'Total Suppliers',
      icon: Truck,
      color: '#10b981',
      route: '/app/suppliers'
    },
    {
      title: "RFQ's",
      subtitle: 'Request for Quotations',
      value: 0,
      subValue: 'Active RFQs',
      icon: FileText,
      color: '#374151',
      route: '/app/procurement'
    },
    {
      title: 'Clients',
      subtitle: 'Client information and projects',
      value: 1,
      subValue: 'Total Clients',
      icon: Building2,
      color: '#f97316',
      route: '/app/clients'
    },
    {
      title: 'Staff',
      subtitle: 'Staff members and management',
      value: 30,
      subValue: 'Total Staff',
      icon: Users,
      color: '#f97316',
      route: '/app/staff'
    },
    {
      title: 'Contractors',
      subtitle: 'Contractor management and projects',
      value: 15,
      subValue: 'Total Contractors',
      icon: UserCheck,
      color: '#3b82f6',
      route: '/app/contractors'
    },
    {
      title: 'Poles Installed',
      subtitle: 'Fiber optic pole installation tracking',
      value: 4,
      subValue: 'Poles Installed',
      icon: Wrench,
      color: '#10b981',
      route: '/app/pole-tracker'
    },
    {
      title: 'Flagged Issues',
      subtitle: 'High priority tasks requiring attention',
      value: 2,
      subValue: 'Issues to Resolve',
      icon: AlertTriangle,
      color: '#ef4444',
      route: '/app/action-items'
    }
  ];

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <DashboardHeader 
          onRefresh={handleRefresh}
          onExport={handleExport}
          isRefreshing={isRefreshing}
        />

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              subtitle={card.subtitle}
              value={card.value}
              subValue={card.subValue}
              icon={card.icon}
              color={card.color}
              route={card.route}
              className="ff-animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {/* Additional Dashboard Content */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">New project "Lawley" created</span>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Staff member "John Doe" added</span>
                </div>
                <span className="text-xs text-gray-500">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">BOQ updated for Mamelodi POP 1</span>
                </div>
                <span className="text-xs text-gray-500">6 hours ago</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => navigate('/app/projects/new')}
                className="flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Create New Project</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button 
                onClick={() => navigate('/app/staff/new')}
                className="flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Add Staff Member</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button 
                onClick={() => navigate('/app/reports')}
                className="flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">Generate Report</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}