/**
 * Procurement section configuration
 */

import {
  ShoppingCart,
  FileText,
  BarChart3,
  Activity,
  FileSignature,
  Truck,
  TrendingUp
} from 'lucide-react';
import type { NavSection } from './types';

export const procurementSection: NavSection = {
  section: 'PROCUREMENT',
  items: [
    {
      to: '/app/procurement',
      icon: ShoppingCart,
      label: 'Procurement Dashboard',
      shortLabel: 'Procure',
      permissions: [],
    },
    {
      to: '/app/procurement/boq',
      icon: FileText,
      label: 'Bill of Quantities',
      shortLabel: 'BOQ',
      permissions: [],
    },
    {
      to: '/app/procurement/rfq',
      icon: FileText,
      label: 'Request for Quote',
      shortLabel: 'RFQ',
      permissions: [],
    },
    {
      to: '/app/procurement/quotes',
      icon: BarChart3,
      label: 'Quote Evaluation',
      shortLabel: 'Quotes',
      permissions: [],
    },
    {
      to: '/app/procurement/stock',
      icon: Activity,
      label: 'Stock Management',
      shortLabel: 'Stock',
      permissions: [],
    },
    {
      to: '/app/procurement/orders',
      icon: FileSignature,
      label: 'Purchase Orders',
      shortLabel: 'Orders',
      permissions: [],
    },
    {
      to: '/app/procurement/suppliers',
      icon: Truck,
      label: 'Suppliers',
      shortLabel: 'Supply',
      permissions: [],
    },
    {
      to: '/app/procurement/reports',
      icon: TrendingUp,
      label: 'Procurement Reports',
      shortLabel: 'Reports',
      permissions: [],
    },
  ]
};