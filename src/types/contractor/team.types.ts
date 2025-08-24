/**
 * Contractor Team Types - Team and member definitions
 */

export interface ContractorTeam {
  id: string;
  contractorId: string;
  
  // Team Details
  teamName: string;
  teamType: 'installation' | 'maintenance' | 'survey' | 'testing' | 'splicing';
  specialization?: string;
  
  // Capacity
  maxCapacity: number;
  currentCapacity: number;
  availableCapacity: number;
  
  // Performance
  efficiency?: number;
  qualityRating?: number;
  safetyRecord?: number;
  
  // Status
  isActive: boolean;
  availability: 'available' | 'busy' | 'unavailable';
  
  // Location
  baseLocation?: string;
  operatingRadius?: number; // km
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  contractorId: string;
  
  // Personal Details
  firstName: string;
  lastName: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  
  // Professional Details
  role: string;
  skillLevel: 'junior' | 'intermediate' | 'senior' | 'expert';
  certifications?: string[];
  specialSkills?: string[];
  
  // Employment
  employmentType: 'permanent' | 'contract' | 'temporary';
  hourlyRate?: number;
  dailyRate?: number;
  
  // Status
  isActive: boolean;
  isTeamLead: boolean;
  
  // Performance
  performanceRating?: number;
  safetyScore?: number;
  
  createdAt: Date;
  updatedAt: Date;
}