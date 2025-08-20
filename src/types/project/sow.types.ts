/**
 * SOW (Statement of Work) related types
 */

export enum SOWDocumentType {
  PROPOSAL = 'proposal',
  CONTRACT = 'contract',
  SOW = 'sow',
  TECHNICAL_SPEC = 'technical_spec',
  BUDGET = 'budget',
  SCHEDULE = 'schedule',
  REPORT = 'report',
  OTHER = 'other'
}

export interface SOWDocument {
  id: string;
  projectId: string;
  name: string;
  type: SOWDocumentType;
  version?: string;
  status: 'draft' | 'review' | 'approved' | 'revised' | 'final';
  url: string;
  size?: number;
  uploadedAt: Date | string;
  uploadedBy?: string;
  approvedBy?: string;
  approvedAt?: Date | string;
  expiryDate?: Date | string;
  tags?: string[];
  notes?: string;
}

export interface SOWRevision {
  id: string;
  sowId: string;
  version: string;
  changes: string;
  changedBy: string;
  changedAt: Date | string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date | string;
  documentUrl?: string;
}

export interface SOWApproval {
  id: string;
  sowId: string;
  approverName: string;
  approverRole: string;
  approverEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'conditional';
  comments?: string;
  conditions?: string[];
  signature?: string;
  signedAt?: Date | string;
  expiresAt?: Date | string;
}