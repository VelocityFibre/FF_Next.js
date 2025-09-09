

interface SOWUploadWizardProps {
  projectName?: string;
  onComplete?: () => void;
}

export function SOWUploadWizard({ projectName = 'Project' }: SOWUploadWizardProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <p className="text-lg">Checking import status for {projectName}...</p>
      <p className="text-sm text-gray-600 mt-2">SOW Upload functionality is being configured.</p>
    </div>
  );
}

export default SOWUploadWizard;