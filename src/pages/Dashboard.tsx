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

interface StatCard {
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

  const statCards: StatCard[] = [
    {
      title: 'Projects',
      subtitle: 'Manage and track all projects',
      value: 4,
      subValue: 'Total Projects',
      icon: FolderOpen,
      color: 'bg-blue-500',
      route: '/app/projects'
    },
    {
      title: 'Suppliers',
      subtitle: 'Supplier management and contacts',
      value: 1,
      subValue: 'Total Suppliers',
      icon: Truck,
      color: 'bg-green-500',
      route: '/app/suppliers'
    },
    {
      title: "RFQ's",
      subtitle: 'Request for Quotations',
      value: 0,
      subValue: 'Active RFQs',
      icon: FileText,
      color: 'bg-gray-700',
      route: '/app/procurement'
    },
    {
      title: 'Clients',
      subtitle: 'Client information and projects',
      value: 1,
      subValue: 'Total Clients',
      icon: Building2,
      color: 'bg-orange-500',
      route: '/app/clients'
    },
    {
      title: 'Staff',
      subtitle: 'Staff members and management',
      value: 30,
      subValue: 'Total Staff',
      icon: Users,
      color: 'bg-orange-500',
      route: '/app/staff'
    },
    {
      title: 'Contractors',
      subtitle: 'Contractor management and projects',
      value: 15,
      subValue: 'Total Contractors',
      icon: UserCheck,
      color: 'bg-blue-500',
      route: '/app/contractors'
    },
    {
      title: 'Poles Installed',
      subtitle: 'Fiber optic pole installation tracking',
      value: 4,
      subValue: 'Poles Installed',
      icon: Wrench,
      color: 'bg-green-500',
      route: '/app/pole-tracker'
    },
    {
      title: 'Flagged Issues',
      subtitle: 'High priority tasks requiring attention',
      value: 2,
      subValue: 'Issues to Resolve',
      icon: AlertTriangle,
      color: 'bg-red-500',
      route: '/app/action-items'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600">Welcome to FibreFlow. Quick access to all your project management tools.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            onClick={() => card.route && navigate(card.route)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{card.subtitle}</p>
            
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500 mt-1">{card.subValue}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Dashboard Sections (to be implemented) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">New project created</p>
                <p className="text-xs text-gray-500">Lawley - LAW001</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Contractor onboarded</p>
                <p className="text-xs text-gray-500">ABC Contractors</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Daily progress updated</p>
                <p className="text-xs text-gray-500">4 poles installed</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/app/projects/new')}
              className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              New Project
            </button>
            <button 
              onClick={() => navigate('/app/daily-progress')}
              className="px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              Daily Progress
            </button>
            <button 
              onClick={() => navigate('/app/pole-tracker')}
              className="px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              Pole Tracker
            </button>
            <button 
              onClick={() => navigate('/app/reports')}
              className="px-4 py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
            >
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}