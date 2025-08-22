import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SidebarStyles } from './types';
import type { ThemeConfig } from '@/types/theme.types';

interface CollapseToggleProps {
  isCollapsed: boolean;
  onCollapse: () => void;
  sidebarStyles: SidebarStyles;
  themeConfig: ThemeConfig;
}

export function CollapseToggle({ isCollapsed, onCollapse, sidebarStyles, themeConfig }: CollapseToggleProps) {
  return (
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
  );
}