/**
 * People & Management section configuration
 */

import { Users } from 'lucide-react';
import type { NavSection } from './types';

export const peopleSection: NavSection = {
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
};