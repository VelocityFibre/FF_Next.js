/**
 * Neon SOW Display Types and Interfaces
 */

export interface NeonSOWDisplayProps {
  projectId: string;
}

export type NeonTabType = 'summary' | 'poles' | 'drops' | 'fibre';

export interface TabConfig {
  id: string;
  label: string;
  icon: any;
}

export interface SOWData {
  poles: any[];
  drops: any[];
  fibre: any[];
  summary: {
    totalPoles: number;
    totalDrops: number;
    totalFibre: number;
  };
}

export interface NeonHealthData {
  connected: boolean;
  availableTables?: string[];
  info?: {
    version?: string;
  };
}