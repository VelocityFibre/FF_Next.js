import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User, 
  RefreshCw, 
  Menu,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// import { useTheme } from '@/contexts/ThemeContext'; // Ready for future use
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { User as UserType } from '@/types/auth.types';

interface HeaderProps {
  title?: string;
  breadcrumbs?: string[];
  actions?: React.ReactNode;
  showSearch?: boolean;
  onMenuClick?: () => void;
  user?: UserType | null;
}

export function Header({ 
  title = 'Dashboard', 
  breadcrumbs = ['Home'],
  actions,
  showSearch = true,
  onMenuClick,
  user
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, title: 'New project assigned', time: '5 min ago', unread: true },
    { id: 2, title: 'Staff member added', time: '1 hour ago', unread: true },
    { id: 3, title: 'Report generated', time: '2 hours ago', unread: false },
  ]);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { signOut, currentUser } = useAuth();
  // Theme hook ready for future use
  // const { theme } = useTheme();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = () => {
    const userToUse = user || currentUser;
    if (userToUse?.displayName) {
      return userToUse.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (userToUse?.email) {
      return userToUse.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    const userToUse = user || currentUser;
    return userToUse?.displayName || userToUse?.email || 'User';
  };

  const getUserRole = () => {
    const userToUse = user || currentUser;
    return userToUse?.role?.replace('_', ' ').toUpperCase() || 'USER';
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-surface-primary border-b border-border-primary shadow-sm">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Menu button (mobile) + Title + Breadcrumbs */}
          <div className="flex items-center flex-1 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg lg:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-col min-w-0">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 1 && (
                <nav className="flex items-center space-x-1 text-sm text-text-tertiary mb-1">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
                      <span className={index === breadcrumbs.length - 1 ? 'text-text-primary font-medium' : ''}>
                        {crumb}
                      </span>
                    </div>
                  ))}
                </nav>
              )}
              
              {/* Page title */}
              <h1 className="text-xl lg:text-2xl font-semibold text-text-primary truncate">
                {title}
              </h1>
            </div>
          </div>

          {/* Center - Actions */}
          {actions && (
            <div className="hidden lg:flex items-center space-x-2 mx-4">
              {actions}
            </div>
          )}

          {/* Right side - Search + Theme + Notifications + User */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Global search */}
            {showSearch && (
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search projects, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-border-primary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
              </div>
            )}

            {/* Theme toggle */}
            <ThemeToggle variant="compact" showLabel={false} />

            {/* Sync/Refresh button */}
            <button 
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
              title="Sync data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-elevated rounded-lg shadow-xl border border-border-primary py-2 z-50">
                  <div className="px-4 py-2 border-b border-border-secondary">
                    <h3 className="font-medium text-text-primary">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-l-4 hover:bg-surface-secondary ${
                          notification.unread ? 'border-l-primary-500 bg-primary-50' : 'border-l-transparent'
                        }`}
                      >
                        <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                        <p className="text-xs text-text-tertiary mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-border-secondary">
                    <Link to="/app/notifications" className="text-sm text-primary-600 hover:text-primary-700">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-text-primary">{getUserName()}</p>
                  <p className="text-xs text-text-tertiary">{getUserRole()}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-elevated rounded-lg shadow-xl border border-border-primary py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border-secondary">
                    <p className="font-medium text-text-primary">{getUserName()}</p>
                    <p className="text-sm text-text-tertiary">{(user || currentUser)?.email}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800 mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      {getUserRole()}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/app/profile');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary w-full text-left"
                    >
                      <User className="h-4 w-4 mr-3" />
                      My Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/app/settings');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary w-full text-left"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/app/help');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary w-full text-left"
                    >
                      <HelpCircle className="h-4 w-4 mr-3" />
                      Help & Support
                    </button>
                  </div>

                  <hr className="my-1 border-border-secondary" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-error-600 hover:bg-error-50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}