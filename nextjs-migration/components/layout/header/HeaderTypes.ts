/**
 * Header component types and interfaces
 */

import { User as UserType } from '@/types/auth.types';

export interface HeaderProps {
  title?: string;
  breadcrumbs?: string[];
  actions?: React.ReactNode;
  showSearch?: boolean;
  onMenuClick?: () => void;
  user?: UserType | null;
}

export interface Notification {
  id: number;
  title: string;
  time: string;
  unread: boolean;
}

export interface BreadcrumbsProps {
  breadcrumbs: string[];
  title: string;
  onMenuClick?: () => void;
}

export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface NotificationsDropdownProps {
  notifications: Notification[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  notificationRef: React.RefObject<HTMLDivElement>;
}

export interface UserMenuDropdownProps {
  user?: UserType | null;
  currentUser?: UserType | null;
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  userMenuRef: React.RefObject<HTMLDivElement>;
  onLogout: () => void;
}