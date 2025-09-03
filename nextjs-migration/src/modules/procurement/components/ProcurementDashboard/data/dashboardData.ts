/**
 * Procurement Dashboard Data
 * Mock data and configuration for dashboard components
 */

import { 
  FileText, 
  BarChart3, 
  Activity, 
  FileSignature, 
  Truck, 
  Plus,
  TrendingUp
} from 'lucide-react';
import { DashboardCard, QuickAction, RecentActivity, QuickStat } from '../types/dashboard.types';

export const dashboardCards: DashboardCard[] = [
  {
    title: 'Active BOQs',
    count: 12,
    icon: FileText,
    color: 'blue',
    link: '/app/procurement/boq',
    description: 'Bills of Quantities under review'
  },
  {
    title: 'Open RFQs',
    count: 8,
    icon: FileText,
    color: 'purple',
    link: '/app/procurement/rfq',
    description: 'Requests for Quote awaiting responses'
  },
  {
    title: 'Pending Quotes',
    count: 23,
    icon: BarChart3,
    color: 'orange',
    link: '/app/procurement/quotes',
    description: 'Quotes requiring evaluation'
  },
  {
    title: 'Stock Alerts',
    count: 5,
    icon: Activity,
    color: 'red',
    link: '/app/procurement/stock',
    description: 'Items requiring attention'
  },
  {
    title: 'Purchase Orders',
    count: 18,
    icon: FileSignature,
    color: 'green',
    link: '/app/procurement/orders',
    description: 'Active purchase orders'
  },
  {
    title: 'Active Suppliers',
    count: 45,
    icon: Truck,
    color: 'indigo',
    link: '/app/procurement/suppliers',
    description: 'Registered suppliers'
  }
];

export const quickActions: QuickAction[] = [
  {
    label: 'Upload BOQ',
    icon: Plus,
    link: '/app/procurement/boq/upload',
    color: 'blue'
  },
  {
    label: 'Create RFQ',
    icon: Plus,
    link: '/app/procurement/rfq/create',
    color: 'purple'
  },
  {
    label: 'Create Order',
    icon: Plus,
    link: '/app/procurement/orders/create',
    color: 'green'
  },
  {
    label: 'View Reports',
    icon: TrendingUp,
    link: '/app/procurement/reports',
    color: 'orange'
  }
];

export const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'BOQ',
    action: 'uploaded',
    item: 'Project Alpha BOQ v2.1',
    timestamp: '2 hours ago',
    status: 'success'
  },
  {
    id: '2',
    type: 'RFQ',
    action: 'issued',
    item: 'RFQ-2024-001 - Fiber Cables',
    timestamp: '4 hours ago',
    status: 'info'
  },
  {
    id: '3',
    type: 'Quote',
    action: 'received',
    item: 'Quote from TechSupply Co.',
    timestamp: '6 hours ago',
    status: 'warning'
  },
  {
    id: '4',
    type: 'Stock',
    action: 'low stock alert',
    item: 'Single Mode Fiber Cable',
    timestamp: '1 day ago',
    status: 'error'
  }
];

export const quickStats: QuickStat[] = [
  {
    label: "This Month's Spending",
    value: 'R 2,450,000'
  },
  {
    label: 'Average Quote Response',
    value: '3.2 days'
  },
  {
    label: 'Supplier Performance',
    value: '94%',
    color: 'green'
  },
  {
    label: 'Cost Savings (YTD)',
    value: 'R 345,000',
    color: 'green'
  }
];