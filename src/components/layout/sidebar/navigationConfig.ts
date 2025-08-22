import { 
  LayoutDashboard, 
  Users, 
  FolderOpen,
  Wrench,
  CheckCircle,
  BarChart3,
  FileText,
  Settings,
  MessageSquare,
  TrendingUp,
  Smartphone,
  Truck,
  Home,
  Cable,
  Droplets,
  FileSignature,
  ShoppingCart,
  MapPin,
  Camera,
  Briefcase,
  Activity
} from 'lucide-react';
import type { NavSection } from './types';

export const navItems: NavSection[] = [
  // MAIN Section - Available to all authenticated users
  { 
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
  },
  
  // PROJECT MANAGEMENT Section
  { 
    section: 'PROJECT MANAGEMENT', 
    items: [
      { 
        to: '/app/projects', 
        icon: FolderOpen, 
        label: 'Projects',
        shortLabel: 'Proj',
        permissions: [],
      },
      { 
        to: '/app/pole-capture', 
        icon: Camera, 
        label: 'Pole Capture',
        shortLabel: 'Poles',
        permissions: [],
      },
      { 
        to: '/app/fiber-stringing', 
        icon: Cable, 
        label: 'Fiber Stringing',
        shortLabel: 'Fiber',
        permissions: [],
      },
      { 
        to: '/app/drops', 
        icon: Droplets, 
        label: 'Drops Management',
        shortLabel: 'Drops',
        permissions: [],
      },
      { 
        to: '/app/sow-management', 
        icon: FileSignature, 
        label: 'SOW Management',
        shortLabel: 'SOW',
        permissions: [],
      },
      { 
        to: '/app/installations', 
        icon: Home, 
        label: 'Home Installations',
        shortLabel: 'Install',
        permissions: [],
      },
      { 
        to: '/app/tasks', 
        icon: CheckCircle, 
        label: 'Task Management',
        shortLabel: 'Tasks',
        permissions: [],
      },
      { 
        to: '/app/daily-progress', 
        icon: BarChart3, 
        label: 'Daily Progress',
        shortLabel: 'Daily',
        permissions: [],
      },
    ]
  },
  
  // PEOPLE & MANAGEMENT Section
  { 
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
  },
  
  // PROCUREMENT Section
  { 
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
  },
  
  // CONTRACTORS Section
  { 
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
  },
  
  // ANALYTICS & REPORTING Section
  { 
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
  },
  
  // COMMUNICATIONS Section
  { 
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
  },
  
  // FIELD OPERATIONS Section
  { 
    section: 'FIELD OPERATIONS', 
    items: [
      { 
        to: '/app/field', 
        icon: Smartphone, 
        label: 'Field App Portal',
        shortLabel: 'Field',
        permissions: [],
      },
      { 
        to: '/app/onemap', 
        icon: MapPin, 
        label: 'OneMap Data Grid',
        shortLabel: 'OneMap',
        permissions: [],
      },
      { 
        to: '/app/nokia-equipment', 
        icon: Wrench, 
        label: 'Nokia Equipment',
        shortLabel: 'Nokia',
        permissions: [],
      },
    ]
  },
  // SYSTEM Section
  { 
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
  },
];