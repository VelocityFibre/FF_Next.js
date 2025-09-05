/**
 * Main navigation section configuration
 */

import { LayoutDashboard, Users, CheckCircle } from 'lucide-react';
import type { NavSection } from './types';

export const mainSection: NavSection = {
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
};