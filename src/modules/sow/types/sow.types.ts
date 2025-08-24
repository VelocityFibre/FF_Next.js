import { SOWDocument } from '@/modules/projects/types/project.types';

export interface SOWListItem extends SOWDocument {
  projectName: string;
  projectCode: string;
  uploadedByName: string;
  rejectionReason?: string;
}