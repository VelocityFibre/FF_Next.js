/**
 * Communications section configuration
 */

import { MessageSquare, Users, CheckCircle } from 'lucide-react';
import type { NavSection } from './types';

export const communicationsSection: NavSection = {
  section: 'COMMUNICATIONS',
  items: [
    {
      to: '/app/communications',
      icon: MessageSquare,
      label: 'Communications Portal',
      shortLabel: 'Comms',
      permissions: [],
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