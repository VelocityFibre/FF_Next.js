/**
 * Project Service Types
 * Internal service operation types
 */

import { DocumentSnapshot } from 'firebase/firestore';
import { Project } from '../../../types/project.types';

export interface ProjectQueryResult {
  projects: Project[];
  total: number;
  hasMore: boolean;
  lastDoc?: DocumentSnapshot;
}

export interface ProjectTeamMember {
  staffId: string;
  name: string;
  role: string;
  position: string;
  assignedDate: string;
  isActive: boolean;
}