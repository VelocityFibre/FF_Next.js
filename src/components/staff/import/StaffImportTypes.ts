/**
 * Staff Import component types and interfaces
 */

import { StaffImportResult } from '@/types/staff.types';

export interface StaffImportProps {
  onComplete?: () => void;
}

export interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export interface FilePreviewProps {
  file: File;
  isImporting: boolean;
  onImport: () => void;
  onCancel: () => void;
}

export interface ImportResultsProps {
  result: StaffImportResult;
  onReset: () => void;
}

export interface ImportActionsProps {
  onDownloadTemplate: () => void;
  onExportAll: () => void;
}