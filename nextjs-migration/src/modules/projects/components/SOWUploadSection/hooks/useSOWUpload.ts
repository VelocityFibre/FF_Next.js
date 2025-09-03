import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useSOWService } from '@/hooks/useSOW';
import { sowDataProcessor } from '@/services/sowDataProcessor';
import { neonSOWService } from '@/services/neonSOWService';
import { SOWFile, FileTypeConfig } from '../types/sowUpload.types';
import { log } from '@/lib/logger';

export function useSOWUpload(
  projectId: string,
  onDataUpdate?: (data: { poles?: any[]; drops?: any[]; fibre?: any[] }) => void
) {
  const [files, setFiles] = useState<SOWFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const sowService = useSOWService();

  const updateFileStatus = (
    type: string,
    status: SOWFile['status'],
    message?: string,
    data?: any[],
    summary?: SOWFile['summary']
  ) => {
    setFiles(prev => prev.map(f =>
      f.type === type
        ? { ...f, status, message, data, summary } as SOWFile
        : f
    ));
  };

  const saveToFirebase = async (type: string, data: any[]) => {
    try {
      await sowService.saveSOWData(projectId, type, data);
    } catch (error) {
      log.error(`Error saving ${type} to Firebase:`, { data: error }, 'useSOWUpload');
      throw error;
    }
  };

  const processFile = async (sowFile: SOWFile) => {
    setIsProcessing(true);

    try {
      updateFileStatus(sowFile.type, 'processing', 'Reading file...');

      // Process file using sowDataProcessor for Lawley-format compatibility
      const rawData = await sowDataProcessor.processFile(sowFile.file, sowFile.type);

      if (!rawData || rawData.length === 0) {
        updateFileStatus(sowFile.type, 'error', 'File is empty or has invalid format');
        setIsProcessing(false);
        return;
      }

      updateFileStatus(sowFile.type, 'processing', 'Processing data...');

      // Process data based on type using Lawley-format processor
      let processedData: any[] = [];
      let validation: any = { valid: [], invalid: [], errors: [] };

      switch (sowFile.type) {
        case 'poles': {
          const poles = sowDataProcessor.processPoles(rawData);
          validation = sowDataProcessor.validatePoles(poles);
          processedData = validation.valid;
          break;
        }
        case 'drops': {
          const drops = sowDataProcessor.processDrops(rawData);
          validation = sowDataProcessor.validateDrops(drops);
          processedData = validation.valid;
          break;
        }
        case 'fibre': {
          const fibres = sowDataProcessor.processFibre(rawData);
          validation = sowDataProcessor.validateFibre(fibres);
          processedData = validation.valid;
          break;
        }
      }

      if (processedData.length === 0) {
        updateFileStatus(sowFile.type, 'error', 'No valid data found in file');
        setIsProcessing(false);
        return;
      }

      // Initialize Neon tables if not exists
      updateFileStatus(sowFile.type, 'processing', 'Initializing database...');
      await neonSOWService.initializeTables(projectId);

      // Upload to Neon database
      updateFileStatus(sowFile.type, 'processing', `Uploading ${processedData.length} items to database...`);

      let uploadResult;
      switch (sowFile.type) {
        case 'poles':
          uploadResult = await neonSOWService.uploadPoles(projectId, processedData);
          break;
        case 'drops':
          uploadResult = await neonSOWService.uploadDrops(projectId, processedData);
          break;
        case 'fibre':
          uploadResult = await neonSOWService.uploadFibre(projectId, processedData);
          break;
      }

      // Also save to Firebase for backward compatibility
      await saveToFirebase(sowFile.type, processedData);

      // Update status with success
      updateFileStatus(sowFile.type, 'success', uploadResult?.message || 'Data uploaded successfully', processedData, {
        total: rawData.length,
        valid: processedData.length,
        invalid: validation.invalid.length,
        warnings: validation.errors.length > 0 ? validation.errors : undefined
      });

      // Update parent component
      if (onDataUpdate) {
        const currentData = files.reduce((acc, f) => {
          if (f.data) {
            acc[f.type] = f.data;
          }
          return acc;
        }, {} as any);

        currentData[sowFile.type] = processedData;
        onDataUpdate(currentData);
      }

    } catch (error) {
      log.error(`Error processing ${sowFile.type} file:`, { data: error }, 'useSOWUpload');
      updateFileStatus(sowFile.type, 'error', `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (type: 'poles' | 'drops' | 'fibre', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Remove any existing file of the same type
    setFiles(prev => prev.filter(f => f.type !== type));

    // Add new file with pending status
    const newFile: SOWFile = {
      type,
      file,
      status: 'pending'
    };
    setFiles(prev => [...prev, newFile]);

    // Process the file
    await processFile(newFile);
  };

  const removeFile = (type: string) => {
    setFiles(prev => prev.filter(f => f.type !== type));
  };

  const downloadTemplate = (fileType: FileTypeConfig) => {
    // Create workbook with sample data
    const ws = XLSX.utils.json_to_sheet(fileType.sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Download file
    XLSX.writeFile(wb, `${fileType.type}_template.xlsx`);
  };

  return {
    files,
    isProcessing,
    handleFileUpload,
    removeFile,
    downloadTemplate
  };
}