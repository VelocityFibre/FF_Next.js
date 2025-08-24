/**
 * Drop Tracker Types
 * Types specific to drop tracking and management
 */

import { BaseTracker } from './base.types';

export interface DropTracker extends BaseTracker {
  type: 'drop';
  dropNumber: string; // Globally unique
  vfDropId: string; // Auto-generated: "LAW.D.H001"
  
  // Connection details
  connectedPoleId?: string; // Which pole this drop connects to
  connectedPoleNumber?: string;
  homeNumber?: string;
  
  // Customer details
  customerName?: string;
  customerContact?: string;
  address: string;
  
  // Installation details
  cableLength?: number; // meters
  cableType?: string;
  ontSerialNumber?: string;
  
  // Service details
  serviceType?: 'residential' | 'business' | 'enterprise';
  packageType?: string;
  activationDate?: Date;
}

export interface DropImportRow {
  dropNumber: string;
  poleNumber: string; // To link to pole
  homeNumber: string;
  customerName?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  cableLength?: number;
  serviceType?: string;
  status?: string;
}