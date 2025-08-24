import { useState } from 'react';
import * as XLSX from 'xlsx';

// Import split components
import { SOWUploadWizardProps, SOWUploadStep, INITIAL_STEPS } from './wizard/SOWWizardTypes';
import { validateStepData, processStepData } from './wizard/SOWDataValidator';
import { SOWStepProgress } from './wizard/SOWStepProgress';
import { SOWFileUploader } from './wizard/SOWFileUploader';
import { SOWWizardNavigation } from './wizard/SOWWizardNavigation';

export function SOWUploadWizard({ projectId, projectName, onComplete }: SOWUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [steps, setSteps] = useState<SOWUploadStep[]>(INITIAL_STEPS);

  const currentStepData = steps[currentStep];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Read Excel file
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Validate data based on step type
      const validationResult = validateStepData(currentStepData.id, data);
      if (!validationResult.isValid) {
        setUploadError(validationResult.error || 'Invalid file format');
        setIsUploading(false);
        return;
      }

      // Update step with file and data
      const updatedSteps = [...steps];
      updatedSteps[currentStep] = {
        ...currentStepData,
        file,
        data: 'processedData' in validationResult ? validationResult.processedData : [],
        completed: true
      };
      setSteps(updatedSteps);

      // Process and store data
      if ('processedData' in validationResult) {
        await processStepData(projectId, currentStepData.id, validationResult.processedData);
      }

      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to process file. Please check the file format.');
      setIsUploading(false);
    }
  };


  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipAll = () => {
    if (confirm('Are you sure you want to skip SOW data upload? You can upload this data later from the project details page.')) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Upload Scope of Work (SOW) Data
          </h2>
          <p className="text-gray-600">
            Project: <span className="font-medium">{projectName}</span>
          </p>
          
          {/* Progress Steps */}
          <SOWStepProgress steps={steps} currentStep={currentStep} />
        </div>

        {/* Content */}
        <SOWFileUploader 
          currentStepData={currentStepData}
          isUploading={isUploading}
          uploadError={uploadError}
          onFileUpload={handleFileUpload}
        />

        {/* Footer */}
        <SOWWizardNavigation
          steps={steps}
          currentStep={currentStep}
          onSkipAll={handleSkipAll}
          onBack={handleBack}
          onNext={handleNext}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}