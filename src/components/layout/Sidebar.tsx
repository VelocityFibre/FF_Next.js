import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen,
  Wrench,
  CheckCircle,
  BarChart3,
  FileText,
  Settings,
  MessageSquare,
  TrendingUp,
  Smartphone,
  Truck,
  ChevronLeft,
  ChevronRight,
  Home,
  Cable,
  Droplets,
  FileSignature,
  ShoppingCart,
  MapPin,
  Camera,
  Briefcase,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import VFLogo from '@/components/ui/VFLogo';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onCollapse }: SidebarProps) {
  const { currentUser, hasPermission } = useAuth();
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
          to: '/app/meetings', 
          icon: Users, 
          label: 'Meetings',
          shortLabel: 'Meet',
          permissions: [],
        },
        { 
          to: '/app/action-items', 
          icon: CheckCircle, 
          label: 'Action Items',
          shortLabel: 'Actions',
          permissions: [],
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
          permissions: [],
        },
        { 
          to: '/app/pole-capture', 
          icon: Camera, 
          label: 'Pole Capture',
          shortLabel: 'Poles',
          permissions: [],
        },
        { 
          to: '/app/fiber-stringing', 
          icon: Cable, 
          label: 'Fiber Stringing',
          shortLabel: 'Fiber',
          permissions: [],
        },
        { 
          to: '/app/drops', 
          icon: Droplets, 
          label: 'Drops Management',
          shortLabel: 'Drops',
          permissions: [],
        },
        { 
          to: '/app/sow-management', 
          icon: FileSignature, 
          label: 'SOW Management',
          shortLabel: 'SOW',
          permissions: [],
        },
        { 
          to: '/app/installations', 
          icon: Home, 
          label: 'Home Installations',
          shortLabel: 'Install',
          permissions: [],
        },
        { 
          to: '/app/tasks', 
          icon: CheckCircle, 
          label: 'Task Management',
          shortLabel: 'Tasks',
          permissions: [],
        },
        { 
          to: '/app/daily-progress', 
          icon: BarChart3, 
          label: 'Daily Progress',
          shortLabel: 'Daily',
          permissions: [],
        },
      ]
    },
    
    // PEOPLE & MANAGEMENT Section
    { 
      section: 'PEOPLE & MANAGEMENT', 
      items: [
        { 
          to: '/app/clients', 
          icon: Users, 
          label: 'Clients',
          shortLabel: 'Clients',
          permissions: [],
        },
        { 
          to: '/app/staff', 
          icon: Users, 
          label: 'Staff',
          shortLabel: 'Staff',
          permissions: [],
        },
      ]
    },
    
    // PROCUREMENT Section
    { 
      section: 'PROCUREMENT', 
      items: [
        { 
          to: '/app/procurement', 
          icon: ShoppingCart, 
          label: 'Procurement',
          shortLabel: 'Procure',
          permissions: [],
        },
        { 
          to: '/app/procurement/boq', 
          icon: FileText, 
          label: 'Bill of Quantities',
          shortLabel: 'BOQ',
          permissions: [],
        },
        { 
          to: '/app/procurement/rfq', 
          icon: FileText, 
          label: 'Request for Quote',
          shortLabel: 'RFQ',
          permissions: [],
        },
        { 
          to: '/app/procurement/suppliers', 
          icon: Truck, 
          label: 'Suppliers',
          shortLabel: 'Supply',
          permissions: [],
        },
      ]
    },
    
    // CONTRACTORS Section
    { 
      section: 'CONTRACTORS', 
      items: [
        { 
          to: '/app/contractors', 
          icon: Briefcase, 
          label: 'Contractors Portal',
          shortLabel: 'Contract',
          permissions: [],
        },
      ]
    },
    
    // ANALYTICS & REPORTING Section
    { 
      section: 'ANALYTICS', 
      items: [
        { 
          to: '/app/analytics', 
          icon: Activity, 
          label: 'Analytics Dashboard',
          shortLabel: 'Analytics',
          permissions: [],
        },
        { 
          to: '/app/enhanced-kpis', 
          icon: TrendingUp, 
          label: 'Enhanced KPIs',
          shortLabel: 'KPIs',
          permissions: [],
        },
        { 
          to: '/app/kpi-dashboard', 
          icon: BarChart3, 
          label: 'KPI Dashboard',
          shortLabel: 'KPI Dash',
          permissions: [],
        },
        { 
          to: '/app/reports', 
          icon: FileText, 
          label: 'Reports',
          shortLabel: 'Reports',
          permissions: [],
        },
      ]
    },
    
    // COMMUNICATIONS Section
    { 
      section: 'COMMUNICATIONS', 
      items: [
        { 
          to: '/app/communications', 
          icon: MessageSquare, 
          label: 'Communications Portal',
          shortLabel: 'Comms',
          permissions: [],
        },
        { 
          to: '/app/meetings', 
          icon: Users, 
          label: 'Meetings',
          shortLabel: 'Meet',
          permissions: [],
        },
        { 
          to: '/app/action-items', 
          icon: CheckCircle, 
          label: 'Action Items',
          shortLabel: 'Actions',
          permissions: [],
        },
      ]
    },
    
    // FIELD OPERATIONS Section
    { 
      section: 'FIELD OPERATIONS', 
      items: [
        { 
          to: '/app/field', 
          icon: Smartphone, 
          label: 'Field App Portal',
          shortLabel: 'Field',
          permissions: [],
        },
        { 
          to: '/app/onemap', 
          icon: MapPin, 
          label: 'OneMap Data Grid',
          shortLabel: 'OneMap',
          permissions: [],
        },
        { 
          to: '/app/nokia-equipment', 
          icon: Wrench, 
          label: 'Nokia Equipment',
          shortLabel: 'Nokia',
          permissions: [],
        },
      ]
    },
    // SYSTEM Section
    { 
      section: 'SYSTEM', 
      items: [
        { 
          to: '/app/settings', 
          icon: Settings, 
          label: 'Settings',
          shortLabel: 'Settings',
          permissions: [],
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

  // Get theme-aware sidebar styles
  const getSidebarStyles = () => {
    const baseStyles = themeConfig.name === 'vf' ? {
      backgroundColor: themeConfig.colors.surface.sidebar || themeConfig.colors.surface.primary,
      borderColor: themeConfig.colors.border.sidebar || themeConfig.colors.border.primary,
      textColor: themeConfig.colors.text.sidebarPrimary || themeConfig.colors.text.primary,
      textColorSecondary: themeConfig.colors.text.sidebarSecondary || themeConfig.colors.text.secondary,
      textColorTertiary: themeConfig.colors.text.sidebarTertiary || themeConfig.colors.text.tertiary
    } : {
      backgroundColor: themeConfig.colors.surface.primary,
      borderColor: themeConfig.colors.border.primary,
      textColor: themeConfig.colors.text.primary,
      textColorSecondary: themeConfig.colors.text.secondary,
      textColorTertiary: themeConfig.colors.text.tertiary
    };

    return baseStyles;
  };

  const sidebarStyles = getSidebarStyles();
  
  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-full shadow-lg transition-all duration-300 z-30 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
        style={{
          backgroundColor: sidebarStyles.backgroundColor,
          borderRight: `1px solid ${sidebarStyles.borderColor}`
        }}
      >
        {/* Single scrollable container for ALL sidebar content */}
        <div className="flex flex-col h-full">
          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            {/* Logo/Brand Section - Now scrollable */}
            <div 
              className={`py-6 px-4 border-b mb-4 ${isCollapsed ? 'px-2' : ''}`}
              style={{ borderColor: sidebarStyles.borderColor }}
            >
              <div className="flex items-center justify-center">
                {/* Use VFLogo for all themes */}
                <VFLogo 
                  size={isCollapsed ? 'medium' : 'large'} 
                  className="mx-auto"
                />
              </div>
            </div>

            {/* User Profile Section - Now scrollable */}
            <div 
              className={`p-4 border-b mb-4 ${isCollapsed ? 'px-2' : ''}`}
              style={{ borderColor: sidebarStyles.borderColor }}
            >
              {isCollapsed ? (
                /* Collapsed view - centered avatar with tooltip */
                <div className="flex justify-center">
                  <div 
                    className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 relative group cursor-pointer"
                    title={`${getUserName()} - ${getUserRole()}`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                    
                    {/* Tooltip for collapsed view */}
                    <div 
                      className="absolute left-full ml-2 px-3 py-2 text-sm rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap"
                      style={{
                        backgroundColor: themeConfig.colors.surface.elevated,
                        color: themeConfig.colors.text.primary,
                        borderColor: themeConfig.colors.border.primary
                      }}
                    >
                      <div className="font-medium">{getUserName()}</div>
                      <div className="text-xs opacity-75">{getUserRole()}</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Expanded view - full user info */
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="font-medium text-sm truncate"
                      style={{ color: sidebarStyles.textColor }}
                    >
                      {getUserName()}
                    </div>
                    <div 
                      className="text-xs truncate"
                      style={{ color: sidebarStyles.textColorTertiary }}
                    >
                      {getUserRole()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Menu Items - Now part of the same scroll area */}
          {visibleNavItems.map((section, idx) => (
            <div key={idx} className={`${isCollapsed ? 'px-2' : 'px-4'} mb-6`}>
              {!isCollapsed && (
                <div 
                  className="text-xs font-semibold uppercase tracking-wider mb-3 px-2"
                  style={{ color: sidebarStyles.textColorTertiary }}
                >
                  {section.section}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={() =>
                      `flex items-center rounded-lg transition-all duration-200 relative group ${
                        isCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2 space-x-3'
                      }`
                    }
                    style={({ isActive }) => ({
                      backgroundColor: isActive 
                        ? themeConfig.colors.primary[500]
                        : 'transparent',
                      color: isActive 
                        ? '#ffffff'
                        : sidebarStyles.textColorSecondary
                    })}
                    title={isCollapsed ? item.label : undefined}
                    onMouseEnter={(e) => {
                      const navLink = e.currentTarget;
                      const isActive = navLink.classList.contains('active');
                      if (!isActive) {
                        navLink.style.backgroundColor = themeConfig.colors.surface.sidebarSecondary || themeConfig.colors.surface.secondary;
                        navLink.style.color = sidebarStyles.textColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      const navLink = e.currentTarget;
                      const isActive = navLink.classList.contains('active');
                      if (!isActive) {
                        navLink.style.backgroundColor = 'transparent';
                        navLink.style.color = sidebarStyles.textColorSecondary;
                      }
                    }}
                  >
                    <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                    
                    {/* Tooltip for collapsed sidebar */}
                    {isCollapsed && (
                      <div 
                        className="absolute left-full ml-2 px-2 py-1 text-sm rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap"
                        style={{
                          backgroundColor: themeConfig.colors.surface.elevated,
                          color: themeConfig.colors.text.primary,
                          borderColor: themeConfig.colors.border.primary
                        }}
                      >
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
          </nav>

          {/* Collapse toggle button - Fixed at bottom */}
          <div 
            className={`border-t p-2 flex-shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}
            style={{ borderColor: sidebarStyles.borderColor }}
          >
            <button
              onClick={onCollapse}
              className={`
                flex items-center justify-center p-2 rounded-lg 
                transition-colors duration-200
                ${isCollapsed ? 'w-10 h-10' : 'w-full'}
              `}
              style={{
                color: sidebarStyles.textColorSecondary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = sidebarStyles.textColor;
                e.currentTarget.style.backgroundColor = themeConfig.colors.surface.sidebarSecondary || themeConfig.colors.surface.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = sidebarStyles.textColorSecondary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
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
        </div>
      </aside>
    </>
  );
}