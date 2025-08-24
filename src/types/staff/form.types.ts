/**
 * Staff Form Types - Form data structures and UI types
 */

import { Position, Department, StaffLevel, StaffStatus, ContractType, Skill } from './enums.types';

export interface StaffFormData {
  id?: string; // For editing
  name: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  employeeId: string;
  position: Position | string;
  department: Department | string; // Allow string for new departments
  level?: StaffLevel;
  bio?: string;
  specializations?: string[];
  status: StaffStatus;
  managerId?: string;
  reportsTo?: string; // Employee ID of manager
  skills: Skill[];
  experienceYears: number;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  startDate: Date;
  endDate?: Date;
  contractType: ContractType;
  salaryGrade?: string;
  hourlyRate?: number;
  workingHours: string;
  availableWeekends: boolean;
  availableNights: boolean;
  timeZone: string;
  maxProjectCount: number;
  notes?: string;
}

// Dropdown Data Types for UI
export interface StaffDropdownOption {
  id: string;
  name: string;
  email: string;
  position: Position | string;
  department: Department;
  level?: StaffLevel; // Optional for backward compatibility
  status: StaffStatus;
  currentProjectCount: number;
  maxProjectCount: number;
}

// Filter Types
export interface StaffFilter {
  department?: Department[];
  level?: StaffLevel[];
  status?: StaffStatus[];
  skills?: Skill[];
  contractType?: ContractType[];
  managerId?: string;
  city?: string;
  province?: string;
  availableWeekends?: boolean;
  availableNights?: boolean;
  searchTerm?: string;
}