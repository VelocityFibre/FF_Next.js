/**
 * Fiber Tracker Types
 * Types specific to fiber cable tracking and management
 */

import { BaseTracker } from './base.types';

export interface FiberTracker extends BaseTracker {
  type: 'fiber';
  sectionId: string; // Unique section identifier
  vfFiberId: string; // Auto-generated: "LAW.F.S001"
  
  // Route details
  fromLocation: string; // Start point (could be pole, junction, etc.)
  toLocation: string; // End point
  fromPoleId?: string;
  toPoleId?: string;
  
  // Cable details
  cableType: string; // e.g., "24-core", "48-core"
  cableLength: number; // meters
  coreCount: number;
  usedCores?: number;
  
  // Installation details
  installationMethod?: 'aerial' | 'underground' | 'duct';
  depth?: number; // For underground
  height?: number; // For aerial
  
  // Testing
  otdrTestResult?: 'pass' | 'fail' | 'pending';
  signalLoss?: number; // dB
  testDate?: Date;
}

export interface FiberImportRow {
  sectionId: string;
  fromLocation: string;
  toLocation: string;
  fromPole?: string;
  toPole?: string;
  cableType: string;
  cableLength: number;
  coreCount: number;
  installationMethod?: string;
  status?: string;
}