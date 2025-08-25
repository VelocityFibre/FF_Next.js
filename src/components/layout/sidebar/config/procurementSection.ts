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
      to: '/app/procurement',
      icon: ShoppingCart,
      label: 'Procurement Portal',
      shortLabel: 'Procure',
      permissions: [],
      description: 'Dashboard, BOQ, RFQ, Quote Evaluation, Stock Movement, Purchase Orders'
    },
    {
      to: '/app/suppliers',
      icon: Truck,
      label: 'Suppliers Portal',
      shortLabel: 'Supply',
      permissions: [],
      description: 'Dashboard, RFQ Invites, Company Profile, Performance, Documents, Messages'
    },
  ]
};