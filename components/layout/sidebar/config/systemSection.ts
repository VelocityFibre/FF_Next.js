/**
 * System section configuration
 */

import { Settings } from 'lucide-react';
import type { NavSection } from './types';

export const systemSection: NavSection = {
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
};