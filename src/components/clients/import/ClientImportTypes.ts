/**
 * Client Import component types and interfaces
 */

import { ClientImportResult } from '@/types/client.types';

export interface ClientImportProps {
  onComplete?: () => void;
}

export interface ClientFileDropZoneProps {
  onFileSelect: (file: File) => void;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export interface ClientFilePreviewProps {
  file: File;
  isImporting: boolean;
  onImport: () => void;
  onCancel: () => void;
}

export interface ClientImportResultsProps {
  result: ClientImportResult;
  onReset: () => void;
}

export interface ClientImportActionsProps {
  onDownloadTemplate: () => void;
  onExportAll: () => void;
}