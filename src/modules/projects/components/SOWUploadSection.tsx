import { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  Trash2,
  MapPin,
  Home,
  Cable
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSOWService } from '@/hooks/useSOW';
import { cn } from '@/utils/cn';
import { sowDataProcessor } from '@/services/sowDataProcessor';
import { neonSOWService } from '@/services/neonSOWService';

interface SOWFile {
  type: 'poles' | 'drops' | 'fibre';
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string | undefined;
  data?: any[] | undefined;
  summary?: {
    total: number;
    valid: number;
    invalid: number;
    warnings?: string[] | undefined;
  } | undefined;
}

interface SOWUploadSectionProps {
  projectId: string;
  projectName: string;
  onComplete?: () => void;
  onDataUpdate?: (data: { poles?: any[]; drops?: any[]; fibre?: any[] }) => void;
  showActions?: boolean;
}

export function SOWUploadSection({ 
  projectId, 
  onComplete,
  onDataUpdate,
  showActions = true 
}: SOWUploadSectionProps) {
  const [files, setFiles] = useState<SOWFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const sowService = useSOWService();

  const fileTypes = [
    {
      type: 'poles' as const,
      title: 'Poles Data',
      description: 'Excel file with pole numbers, coordinates, and capacity',
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      requiredColumns: ['pole_number', 'latitude', 'longitude'],
      sampleData: [
        { pole_number: 'P001', latitude: -33.9249, longitude: 18.4241, max_drops: 12 },
        { pole_number: 'P002', latitude: -33.9251, longitude: 18.4243, max_drops: 12 }
      ]
    },
    {
      type: 'drops' as const,
      title: 'Drops Data',
      description: 'Excel file with drop numbers, addresses, and pole assignments',
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      requiredColumns: ['drop_number', 'pole_number', 'address'],
      sampleData: [
        { drop_number: 'D001', pole_number: 'P001', address: '123 Main St', status: 'planned' },
        { drop_number: 'D002', pole_number: 'P001', address: '125 Main St', status: 'planned' }
      ]
    },
    {
      type: 'fibre' as const,
      title: 'Fibre Scope',
      description: 'Excel file with cable segments, distances, and types',
      icon: Cable,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      requiredColumns: ['segment_id', 'from_point', 'to_point', 'distance'],
      sampleData: [
        { segment_id: 'S001', from_point: 'P001', to_point: 'P002', distance: 150, cable_type: 'aerial' },
        { segment_id: 'S002', from_point: 'P002', to_point: 'P003', distance: 200, cable_type: 'underground' }
      ]
    }
  ];

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

  const processFile = async (sowFile: SOWFile) => {
    setIsProcessing(true);
    
    try {
      // Update status to processing
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
        case 'poles':
          const poles = sowDataProcessor.processPoles(rawData);
          validation = sowDataProcessor.validatePoles(poles);
          processedData = validation.valid;
          break;
        case 'drops':
          const drops = sowDataProcessor.processDrops(rawData);
          validation = sowDataProcessor.validateDrops(drops);
          processedData = validation.valid;
          break;
        case 'fibre':
          const fibres = sowDataProcessor.processFibre(rawData);
          validation = sowDataProcessor.validateFibre(fibres);
          processedData = validation.valid;
          break;
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
      console.error(`Error processing ${sowFile.type} file:`, error);
      updateFileStatus(sowFile.type, 'error', `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };



  const updateFileStatus = (
    type: string, 
    status: SOWFile['status'], 
    message?: string, 
    data?: any[],
    summary?: SOWFile['summary']
  ) => {
    setFiles(prev => prev.map(f => 
      f.type === type 
        ? { ...f, status, message, data, summary }
        : f
    ));
  };

  const saveToFirebase = async (type: string, data: any[]) => {
    try {
      await sowService.saveSOWData(projectId, type, data);
    } catch (error) {
      console.error(`Error saving ${type} to Firebase:`, error);
      throw error;
    }
  };

  const removeFile = (type: string) => {
    setFiles(prev => prev.filter(f => f.type !== type));
  };

  const downloadTemplate = (type: 'poles' | 'drops' | 'fibre') => {
    const fileType = fileTypes.find(ft => ft.type === type);
    if (!fileType) return;

    // Create workbook with sample data
    const ws = XLSX.utils.json_to_sheet(fileType.sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Download file
    XLSX.writeFile(wb, `${type}_template.xlsx`);
  };

  const allFilesUploaded = fileTypes.every(ft => 
    files.find(f => f.type === ft.type && f.status === 'success')
  );

  return (
    <div className="space-y-6">
      {/* File Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {fileTypes.map((fileType) => {
          const uploadedFile = files.find(f => f.type === fileType.type);
          const Icon = fileType.icon;
          
          return (
            <div
              key={fileType.type}
              className={cn(
                "rounded-lg border-2 border-dashed p-6 transition-colors",
                uploadedFile?.status === 'success' 
                  ? `${fileType.bgColor} ${fileType.borderColor}`
                  : uploadedFile?.status === 'error'
                  ? "bg-error-50 border-error-200"
                  : "border-border-secondary hover:border-border-primary"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2 rounded-lg", fileType.bgColor)}>
                  <Icon className={cn("w-6 h-6", fileType.color)} />
                </div>
                
                {uploadedFile && (
                  <button
                    onClick={() => removeFile(fileType.type)}
                    className="p-1 hover:bg-surface-secondary rounded"
                  >
                    <Trash2 className="w-4 h-4 text-text-tertiary" />
                  </button>
                )}
              </div>

              <h3 className="font-medium text-text-primary mb-1">
                {fileType.title}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {fileType.description}
              </p>

              {uploadedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-text-tertiary" />
                    <span className="text-sm text-text-primary truncate">
                      {uploadedFile.file.name}
                    </span>
                  </div>

                  {uploadedFile.status === 'processing' && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                      <span className="text-sm text-text-secondary">Processing...</span>
                    </div>
                  )}

                  {uploadedFile.status === 'success' && uploadedFile.summary && (
                    <div className="bg-success-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                        <span className="text-sm font-medium text-success-900">
                          Successfully processed
                        </span>
                      </div>
                      <div className="text-xs text-success-700 space-y-1">
                        <p>Total rows: {uploadedFile.summary.total}</p>
                        <p>Valid: {uploadedFile.summary.valid}</p>
                        {uploadedFile.summary.invalid > 0 && (
                          <p>Skipped: {uploadedFile.summary.invalid}</p>
                        )}
                      </div>
                      {uploadedFile.summary.warnings && uploadedFile.summary.warnings.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-warning-600 cursor-pointer">
                            {uploadedFile.summary.warnings.length} warnings
                          </summary>
                          <div className="mt-1 text-xs text-warning-600 max-h-20 overflow-y-auto">
                            {uploadedFile.summary.warnings.slice(0, 5).map((warning, i) => (
                              <p key={i}>{warning}</p>
                            ))}
                            {uploadedFile.summary.warnings.length > 5 && (
                              <p>... and {uploadedFile.summary.warnings.length - 5} more</p>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  )}

                  {uploadedFile.status === 'error' && (
                    <div className="bg-error-50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-error-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-error-900">Upload failed</p>
                          <p className="text-xs text-error-700 mt-1">
                            {uploadedFile.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload(fileType.type, e)}
                      className="hidden"
                      disabled={isProcessing}
                    />
                    <div className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      isProcessing
                        ? "bg-surface-secondary text-text-tertiary cursor-not-allowed"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    )}>
                      <Upload className="w-4 h-4" />
                      Upload File
                    </div>
                  </label>

                  <button
                    onClick={() => downloadTemplate(fileType.type)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {files.length > 0 && (
        <div className="bg-background-secondary rounded-lg p-4">
          <h4 className="text-sm font-medium text-text-primary mb-3">Upload Summary</h4>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.type} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary capitalize">{file.type}:</span>
                <span className={cn(
                  "font-medium",
                  file.status === 'success' ? "text-success-600" : 
                  file.status === 'error' ? "text-error-600" : 
                  file.status === 'processing' ? "text-primary-600" : 
                  "text-text-tertiary"
                )}>
                  {file.status === 'success' && file.data ? `${file.data.length} items` :
                   file.status === 'error' ? 'Failed' :
                   file.status === 'processing' ? 'Processing...' :
                   'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Button */}
      {showActions && allFilesUploaded && onComplete && (
        <div className="flex justify-end">
          <button
            onClick={onComplete}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-success-600 rounded-lg hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Continue with SOW Data
          </button>
        </div>
      )}
    </div>
  );
}