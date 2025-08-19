import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen,
  Wrench,
  Calendar,
  CheckCircle,
  BarChart3,
  FileText,
  Settings,
  Building2,
  Package,
  MessageSquare,
  TrendingUp,
  Smartphone,
  UserCheck,
  Truck,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navItems = [
    // MAIN Section
    { section: 'MAIN', items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/communications', icon: MessageSquare, label: 'Meetings' },
      { to: '/app/action-items', icon: CheckCircle, label: 'Action Items' },
    ]},
    
    // PROJECT MANAGEMENT Section
    { section: 'PROJECT MANAGEMENT', items: [
      { to: '/app/projects', icon: FolderOpen, label: 'Projects' },
      { to: '/app/sow', icon: FileText, label: 'SOW Data Management' },
      { to: '/app/pole-tracker', icon: Wrench, label: 'Pole Tracker (Desktop)' },
      { to: '/app/tasks', icon: CheckCircle, label: 'Task Management' },
      { to: '/app/daily-progress', icon: BarChart3, label: 'Daily Progress' },
      { to: '/app/kpis', icon: TrendingUp, label: 'Enhanced KPIs' },
      { to: '/app/kpi-dashboard', icon: LayoutDashboard, label: 'KPI Dashboard' },
      { to: '/app/reports', icon: FileText, label: 'Reports' },
    ]},
    
    // Other Modules
    { section: 'RESOURCES', items: [
      { to: '/app/clients', icon: Building2, label: 'Clients' },
      { to: '/app/staff', icon: Users, label: 'Staff' },
      { to: '/app/contractors', icon: UserCheck, label: 'Contractors' },
      { to: '/app/suppliers', icon: Truck, label: 'Suppliers' },
    ]},
    
    { section: 'OPERATIONS', items: [
      { to: '/app/procurement', icon: Package, label: 'Procurement' },
      { to: '/app/field', icon: Smartphone, label: 'Field App' },
      { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/app/settings', icon: Settings, label: 'Settings' },
    ]},
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900 text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 w-64`}>
        
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold">DU</span>
            </div>
            <div>
              <div className="font-semibold">Dev User</div>
              <div className="text-xs text-gray-400">dev@test.com</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto h-[calc(100vh-80px)]">
          {navItems.map((section, idx) => (
            <div key={idx} className="px-4 py-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.section}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}