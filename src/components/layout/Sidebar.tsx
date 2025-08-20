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
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { UserRole, Permission } from '@/types/auth.types';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onToggle, onCollapse }: SidebarProps) {
  const { currentUser, hasPermission, hasAnyRole } = useAuth();
  const { themeConfig } = useTheme();

  // Role-based navigation items with permissions
  const navItems = [
    // MAIN Section - Available to all authenticated users
    { 
      section: 'MAIN', 
      items: [
        { 
          to: '/app/dashboard', 
          icon: LayoutDashboard, 
          label: 'Dashboard',
          shortLabel: 'Dash',
          permissions: [], // Available to all
        },
        { 
          to: '/app/communications', 
          icon: MessageSquare, 
          label: 'Communications',
          shortLabel: 'Comm',
          permissions: [Permission.VIEW_COMMUNICATIONS],
        },
        { 
          to: '/app/action-items', 
          icon: CheckCircle, 
          label: 'Action Items',
          shortLabel: 'Tasks',
          permissions: [Permission.VIEW_COMMUNICATIONS],
        },
      ]
    },
    
    // PROJECT MANAGEMENT Section
    { 
      section: 'PROJECT MANAGEMENT', 
      items: [
        { 
          to: '/app/projects', 
          icon: FolderOpen, 
          label: 'Projects',
          shortLabel: 'Proj',
          permissions: [Permission.VIEW_PROJECTS],
        },
        { 
          to: '/app/sow', 
          icon: FileText, 
          label: 'SOW Management',
          shortLabel: 'SOW',
          permissions: [Permission.VIEW_PROJECTS],
        },
        { 
          to: '/app/pole-tracker', 
          icon: Wrench, 
          label: 'Pole Tracker',
          shortLabel: 'Poles',
          permissions: [Permission.VIEW_PROJECTS],
        },
        { 
          to: '/app/daily-progress', 
          icon: BarChart3, 
          label: 'Daily Progress',
          shortLabel: 'Daily',
          permissions: [Permission.VIEW_ANALYTICS],
        },
        { 
          to: '/app/kpis', 
          icon: TrendingUp, 
          label: 'KPIs',
          shortLabel: 'KPI',
          permissions: [Permission.VIEW_ANALYTICS],
        },
      ]
    },
    
    // RESOURCES Section
    { 
      section: 'RESOURCES', 
      items: [
        { 
          to: '/app/clients', 
          icon: Building2, 
          label: 'Clients',
          shortLabel: 'Clients',
          permissions: [Permission.VIEW_CLIENTS],
        },
        { 
          to: '/app/staff', 
          icon: Users, 
          label: 'Staff',
          shortLabel: 'Staff',
          permissions: [Permission.VIEW_STAFF],
        },
        { 
          to: '/app/contractors', 
          icon: UserCheck, 
          label: 'Contractors',
          shortLabel: 'Contr',
          permissions: [Permission.VIEW_CONTRACTORS],
        },
        { 
          to: '/app/suppliers', 
          icon: Truck, 
          label: 'Suppliers',
          shortLabel: 'Supp',
          permissions: [Permission.VIEW_SUPPLIERS],
        },
      ]
    },
    
    // OPERATIONS Section
    { 
      section: 'OPERATIONS', 
      items: [
        { 
          to: '/app/procurement', 
          icon: Package, 
          label: 'Procurement',
          shortLabel: 'Proc',
          permissions: [Permission.VIEW_PROCUREMENT],
        },
        { 
          to: '/app/field', 
          icon: Smartphone, 
          label: 'Field App',
          shortLabel: 'Field',
          permissions: [Permission.VIEW_PROJECTS], // Field technicians need project access
        },
        { 
          to: '/app/analytics', 
          icon: BarChart3, 
          label: 'Analytics',
          shortLabel: 'Analytics',
          permissions: [Permission.VIEW_ANALYTICS],
        },
        { 
          to: '/app/settings', 
          icon: Settings, 
          label: 'Settings',
          shortLabel: 'Settings',
          permissions: [Permission.MANAGE_SETTINGS],
        },
      ]
    },
  ];

  // Filter navigation items based on user permissions
  const getVisibleNavItems = () => {
    return navItems.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // If no permissions required, show to all authenticated users
        if (item.permissions.length === 0) return true;
        
        // Check if user has any of the required permissions
        return item.permissions.some(permission => hasPermission(permission));
      })
    })).filter(section => section.items.length > 0); // Remove empty sections
  };

  const visibleNavItems = getVisibleNavItems();

  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (currentUser?.email) {
      return currentUser.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    return currentUser?.displayName || currentUser?.email || 'User';
  };

  const getUserRole = () => {
    return currentUser?.role?.replace('_', ' ').toUpperCase() || 'USER';
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-surface-primary border-r border-border-primary
        shadow-lg transition-all duration-300 z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        
        {/* Logo/Brand Section */}
        <div className={`p-4 border-b border-border-secondary ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">FF</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-bold text-text-primary text-lg truncate">FibreFlow</div>
                <div className="text-xs text-text-tertiary">Project Management</div>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Section */}
        <div className={`p-4 border-b border-border-secondary ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {getUserInitials()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text-primary text-sm truncate">
                  {getUserName()}
                </div>
                <div className="text-xs text-text-tertiary truncate">
                  {getUserRole()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {visibleNavItems.map((section, idx) => (
            <div key={idx} className={`${isCollapsed ? 'px-2' : 'px-4'} mb-6`}>
              {!isCollapsed && (
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-2">
                  {section.section}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg transition-all duration-200 relative group ${
                        isCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2 space-x-3'
                      } ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                      }`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                    
                    {/* Tooltip for collapsed sidebar */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-surface-elevated text-text-primary text-sm rounded-md shadow-lg border border-border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle button */}
        <div className={`border-t border-border-secondary p-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={onCollapse}
            className={`
              flex items-center justify-center p-2 rounded-lg 
              text-text-secondary hover:text-text-primary hover:bg-surface-secondary
              transition-colors duration-200
              ${isCollapsed ? 'w-10 h-10' : 'w-full'}
            `}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}