/**
 * Client Summary and Analytics Types
 * Summary statistics and metrics interfaces
 */

import { Timestamp } from 'firebase/firestore';
import { Client } from './core.types';

export interface ClientSummary {
  totalClients: number;
  activeClients: number;
  prospectClients: number;
  inactiveClients: number;
  totalProjectValue: number;
  averageProjectValue: number;
  topClientsByValue: Client[];
  clientsByCategory: { [key: string]: number };
  clientsByStatus: { [key: string]: number };
  clientsByPriority: { [key: string]: number };
  monthlyGrowth: number;
  conversionRate: number;
}

export interface ClientMetrics {
  clientId: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalProjectValue: number;
  averageProjectValue: number;
  lastProjectDate?: Timestamp;
  averageProjectDuration: number;
  onTimeCompletionRate: number;
}