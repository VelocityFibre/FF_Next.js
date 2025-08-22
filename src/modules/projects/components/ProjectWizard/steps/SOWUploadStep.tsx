import { SOWUploadSection } from '../../SOWUploadSection';

interface SOWUploadStepProps {
  projectId?: string;
}

export function SOWUploadStep({ projectId }: SOWUploadStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Statement of Work
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Upload SOW documents to populate project specifications automatically
        </p>
      </div>

      {projectId ? (
        <SOWUploadSection 
          projectId={projectId}
          onUploadComplete={() => {
            // Handle upload completion
            console.log('SOW upload completed');
          }}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Project must be created before uploading SOW documents
        </div>
      )}
    </div>
  );
}