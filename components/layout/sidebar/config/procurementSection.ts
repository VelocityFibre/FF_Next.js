/**
 * Procurement section configuration - Updated for Portal Architecture
 */

import {
  ShoppingCart,
  Truck,
} from 'lucide-react';
import type { NavSection } from './types';

export const procurementSection: NavSection = {
  section: 'PROCUREMENT',
  items: [
    {
      to: '/procurement',
      icon: ShoppingCart,
      label: 'Procurement Portal',
      shortLabel: 'Procure',
      permissions: []
    },
    {
      to: '/suppliers',
      icon: Truck,
      label: 'Suppliers Portal',
      shortLabel: 'Supply',
      permissions: []
    },
  ]
};