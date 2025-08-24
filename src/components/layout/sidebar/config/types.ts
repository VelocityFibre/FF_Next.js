/**
 * Navigation configuration types
 */

import { LucideIcon } from 'lucide-react';
import { Permission } from '@/types/auth.types';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  shortLabel: string;
  permissions: Permission[];
  subItems?: NavItem[];
}

export interface NavSection {
  section: string;
  items: NavItem[];
}