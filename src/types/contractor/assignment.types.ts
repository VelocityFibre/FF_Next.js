/**
 * Project Assignment Types - Contractor project assignments
 */

export interface ProjectAssignment {
  id: string;
  projectId: string; // Firebase project ID
  contractorId: string;
  teamId?: string;
  
  // Assignment Details
  assignmentType: 'primary' | 'subcontractor' | 'consultant' | 'specialist';
  scope: string;
  responsibilities?: string[];
  
  // Timeline
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Financial
  contractValue: number;
  paidAmount: number;
  outstandingAmount?: number;
  
  // Status
  status: AssignmentStatus;
  progressPercentage: number;
  
  // Performance
  performanceRating?: number;
  qualityScore?: number;
  timelinessScore?: number;
  
  // Notes
  assignmentNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type AssignmentStatus = 'assigned' | 'active' | 'completed' | 'cancelled' | 'on_hold';