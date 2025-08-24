/**
 * Cable Drum Types - Drum tracking and usage definitions
 */

import { DrumConditionType, InstallationStatusType, InstallationType } from './enums.types';

// Cable Drum interface matching database schema
export interface CableDrum {
  id: string;
  projectId: string;
  stockPositionId?: string;
  
  // Drum Identification
  drumNumber: string;
  serialNumber?: string;
  supplierDrumId?: string;
  
  // Cable Details
  cableType: string;
  cableSpecification?: string;
  manufacturerName?: string;
  partNumber?: string;
  
  // Drum Measurements
  originalLength: number; // meters
  currentLength: number;
  usedLength: number;
  
  // Physical Properties
  drumWeight?: number; // kg
  cableWeight?: number; // kg
  drumDiameter?: number; // mm
  
  // Location and Status
  currentLocation?: string;
  drumCondition: DrumConditionType;
  installationStatus: InstallationStatusType;
  
  // Tracking History
  lastMeterReading?: number;
  lastReadingDate?: Date;
  lastUsedDate?: Date;
  
  // Quality and Testing
  testCertificate?: string;
  installationNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Drum Usage History interface matching database schema
export interface DrumUsageHistory {
  id: string;
  drumId: string;
  projectId: string;
  
  // Usage Details
  usageDate: Date;
  poleNumber?: string;
  sectionId?: string;
  workOrderId?: string;
  
  // Measurements
  previousReading: number;
  currentReading: number;
  usedLength: number;
  
  // Personnel and Equipment
  technicianId?: string;
  technicianName?: string;
  equipmentUsed?: string;
  
  // Installation Details
  installationType?: InstallationType;
  installationNotes?: string;
  qualityNotes?: string;
  
  // GPS Coordinates
  startCoordinates?: { lat: number; lng: number };
  endCoordinates?: { lat: number; lng: number };
  
  // Timestamps
  createdAt: Date;
}