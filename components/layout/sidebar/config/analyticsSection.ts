/**
 * Analytics & Reporting section configuration
 */

import { Activity, TrendingUp, BarChart3, FileText } from 'lucide-react';
import type { NavSection } from './types';

export const analyticsSection: NavSection = {
  section: 'ANALYTICS',
  items: [
    {
      to: '/app/analytics',
      icon: Activity,
      label: 'Analytics Dashboard',
      shortLabel: 'Analytics',
      permissions: [],
    },
    {
      to: '/app/enhanced-kpis',
      icon: TrendingUp,
      label: 'Enhanced KPIs',
      shortLabel: 'KPIs',
      permissions: [],
    },
    {
      to: '/app/kpi-dashboard',
      icon: BarChart3,
      label: 'KPI Dashboard',
      shortLabel: 'KPI Dash',
      permissions: [],
    },
    {
      to: '/app/reports',
      icon: FileText,
      label: 'Reports',
      shortLabel: 'Reports',
      permissions: [],
    },
  ]
};