export interface SOW {
  id: string;
  sowNumber: string;
  projectName: string;
  clientName: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'rejected';
  version: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  scope: string[];
  deliverables: string[];
  milestones: SOWMilestone[];
  approvals: SOWApproval[];
  documents: SOWDocument[];
  createdDate: string;
  lastModified: string;
  createdBy: string;
}

export interface SOWMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  value: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  deliverables: string[];
}

export interface SOWApproval {
  id: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: string;
  comments?: string;
}

export interface SOWDocument {
  id: string;
  name: string;
  type: 'contract' | 'technical' | 'financial' | 'legal' | 'other';
  url: string;
  uploadedDate: string;
  uploadedBy: string;
}

export type SOWFilterType = 'all' | SOW['status'];