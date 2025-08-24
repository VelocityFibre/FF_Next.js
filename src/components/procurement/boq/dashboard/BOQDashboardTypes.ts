/**
 * BOQ Dashboard Types
 * Type definitions for the BOQ Dashboard component
 */

import { BOQStatusType } from '@/types/procurement/boq.types';

export type DashboardView = 'overview' | 'upload' | 'list' | 'viewer' | 'mapping' | 'history';

export interface RecentActivity {
  id: string;
  type: 'upload' | 'mapping' | 'approval' | 'update';
  description: string;
  timestamp: Date;
  userId: string;
  boqId?: string;
}

export interface BOQDashboardProps {
  className?: string;
}

export interface DashboardUtilityFunctions {
  getStatusColor: (status: BOQStatusType) => string;
  formatRelativeTime: (date: Date) => string;
}

export interface QuickStats {
  totalBOQs: number;
  activeBOQs: number;
  pendingReview: number;
  pendingMappings: number;
  approved: number;
  completedMappings: number;
  totalValue: number;
  averageProgress: number;
}