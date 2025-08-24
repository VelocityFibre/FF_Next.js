/**
 * Pole Tracker Types
 * Types specific to pole tracking and management
 */

import { BaseTracker } from './base.types';

export interface PoleTracker extends BaseTracker {
  type: 'pole';
  poleNumber: string; // Globally unique
  vfPoleId: string; // Auto-generated: "LAW.P.A001"
  
  // Pole specific
  poleType?: 'wooden' | 'concrete' | 'steel' | 'fiberglass';
  poleHeight?: number; // meters
  installationDepth?: number; // meters
  
  // Drop connections
  connectedDrops?: string[]; // Drop IDs
  dropCount: number;
  maxCapacity: number; // Usually 12
  
  // Network details
  pon?: string;
  zone?: string;
  distributionType?: 'distribution' | 'feeder';
}

export interface PoleImportRow {
  poleNumber: string;
  location: string;
  latitude?: number;
  longitude?: number;
  poleType?: string;
  height?: number;
  zone?: string;
  pon?: string;
  contractorName?: string;
  teamName?: string;
  plannedDate?: string;
  status?: string;
}