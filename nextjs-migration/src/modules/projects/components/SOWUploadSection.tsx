import { MapPin, Home, Cable } from 'lucide-react';
import { useSOWUpload } from './SOWUploadSection/hooks/useSOWUpload';
import { FileUploadCard } from './SOWUploadSection/components/FileUploadCard';
import { UploadSummary } from './SOWUploadSection/components/UploadSummary';
import { FILE_TYPE_CONFIGS } from './SOWUploadSection/types/sowUpload.types';

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
  const {
    files,
    isProcessing,
    handleFileUpload,
    removeFile,
    downloadTemplate
  } = useSOWUpload(projectId, onDataUpdate);

  // Add icons to file type configs
  const fileTypes = FILE_TYPE_CONFIGS.map(config => ({
    ...config,
    icon: config.type === 'poles' ? MapPin : 
          config.type === 'drops' ? Home : 
          Cable
  }));

  const allFilesUploaded = fileTypes.every(ft => 
    files.find(f => f.type === ft.type && f.status === 'success')
  );

  return (
    <div className="space-y-6">
      {/* File Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {fileTypes.map((fileType) => {
          const uploadedFile = files.find(f => f.type === fileType.type);
          
          return (
            <FileUploadCard
              key={fileType.type}
              fileType={fileType}
              {...(uploadedFile && { uploadedFile })}
              isProcessing={isProcessing}
              onFileUpload={handleFileUpload}
              onRemoveFile={removeFile}
              onDownloadTemplate={() => downloadTemplate(fileType)}
            />
          );
        })}
      </div>

      <UploadSummary
        files={files}
        allFilesUploaded={allFilesUploaded}
        {...(onComplete && { onComplete })}
        showActions={showActions}
      />
    </div>
  );
}