/**
 * Contractors section configuration
 */

import { Briefcase } from 'lucide-react';
import type { NavSection } from './types';

export const contractorsSection: NavSection = {
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
};