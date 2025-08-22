import VFLogo from '@/components/ui/VFLogo';
import { getUserInitials, getUserName, getUserRole } from './userUtils';
import type { User } from '@/types/auth.types';
import type { SidebarStyles } from './types';
import type { ThemeConfig } from '@/types/theme.types';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  currentUser: User | null;
  sidebarStyles: SidebarStyles;
  themeConfig: ThemeConfig;
}

export function SidebarHeader({ isCollapsed, currentUser, sidebarStyles, themeConfig }: SidebarHeaderProps) {
  return (
    <>
      {/* Logo/Brand Section */}
      <div 
        className={`py-6 px-4 border-b mb-4 ${isCollapsed ? 'px-2' : ''}`}
        style={{ borderColor: sidebarStyles.borderColor }}
      >
        <div className="flex items-center justify-center">
          <VFLogo 
            size={isCollapsed ? 'medium' : 'large'} 
            className="mx-auto"
          />
        </div>
      </div>

      {/* User Profile Section */}
      <div 
        className={`p-4 border-b mb-4 ${isCollapsed ? 'px-2' : ''}`}
        style={{ borderColor: sidebarStyles.borderColor }}
      >
        {isCollapsed ? (
          /* Collapsed view - centered avatar with tooltip */
          <div className="flex justify-center">
            <div 
              className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 relative group cursor-pointer"
              title={`${getUserName(currentUser)} - ${getUserRole(currentUser)}`}
            >
              <span className="text-white font-semibold text-sm">
                {getUserInitials(currentUser)}
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
                <div className="font-medium">{getUserName(currentUser)}</div>
                <div className="text-xs opacity-75">{getUserRole(currentUser)}</div>
              </div>
            </div>
          </div>
        ) : (
          /* Expanded view - full user info */
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {getUserInitials(currentUser)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div 
                className="font-medium text-sm truncate"
                style={{ color: sidebarStyles.textColor }}
              >
                {getUserName(currentUser)}
              </div>
              <div 
                className="text-xs truncate"
                style={{ color: sidebarStyles.textColorTertiary }}
              >
                {getUserRole(currentUser)}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}