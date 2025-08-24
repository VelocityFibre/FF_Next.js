/**
 * Staff Base Types - Core staff member definitions
 */

import { Timestamp } from 'firebase/firestore';
import { 
  Department, Position, StaffLevel, StaffStatus, ContractType,
  Skill, Certification, Equipment, TrainingRecord 
} from './enums.types';

export interface StaffMember {
  id?: string;
  
  // Personal Information
  name: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  
  // Employment Details
  employeeId: string;
  position: Position | string; // Allow Position enum or custom string
  department: Department;
  level?: StaffLevel; // Optional for backward compatibility
  status: StaffStatus;
  
  // Manager/Reporting
  managerId?: string;
  managerName?: string;
  reportsTo?: string;
  
  // Skills and Certifications
  skills: Skill[];
  certifications: Certification[];
  experienceYears: number;
  specializations: string[];
  
  // Contact Information
  address: string;
  city: string;
  province: string;
  postalCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Employment Terms
  startDate: Timestamp;
  endDate?: Timestamp;
  contractType: ContractType;
  salaryGrade?: string;
  hourlyRate?: number;
  
  // Availability and Scheduling
  workingHours: string;
  availableWeekends: boolean;
  availableNights: boolean;
  timeZone: string;
  
  // Project Assignments (current active projects)
  activeProjectIds: string[];
  currentProjectCount: number;
  maxProjectCount: number;
  
  // Performance Metrics
  totalProjectsCompleted: number;
  averageProjectRating: number;
  onTimeCompletionRate: number;
  
  // Equipment and Tools
  assignedEquipment: Equipment[];
  vehicleAssigned?: string;
  toolsAssigned: string[];
  
  // Training and Development
  trainingRecords: TrainingRecord[];
  nextTrainingDue?: Timestamp;
  safetyTrainingExpiry?: Timestamp;
  
  // Notes and Comments
  notes?: string;
  performanceNotes?: string;
  
  // Audit Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
  
  // Profile
  profilePhotoUrl?: string;
  bio?: string;
}