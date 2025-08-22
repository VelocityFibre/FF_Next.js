import { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  shortLabel: string;
  permissions: string[];
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
}

export interface SidebarStyles {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  textColorSecondary: string;
  textColorTertiary: string;
}