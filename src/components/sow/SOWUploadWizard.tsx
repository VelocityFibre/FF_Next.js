import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Import split components
import { SOWUploadWizardProps, SOWUploadStep, INITIAL_STEPS } from './wizard/SOWWizardTypes';
import { validateStepData, processStepData } from './wizard/SOWDataValidator';
import { SOWStepProgress } from './wizard/SOWStepProgress';
import { SOWFileUploader } from './wizard/SOWFileUploader';
import { SOWWizardNavigation } from './wizard/SOWWizardNavigation';
import { log } from '@/lib/logger';

export function SOWUploadWizard({ projectId, projectName, onComplete }: SOWUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const [steps, setSteps] = useState<SOWUploadStep[]>(INITIAL_STEPS);

  const currentStepData = steps[currentStep];

  // Check import status on mount and set initial step
  useEffect(() => {
    const checkImportStatus = async () => {
      try {
        const response = await fetch(`/api/sow/import-status/${projectId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            // Update steps based on import status
            const updatedSteps = [...INITIAL_STEPS];
            let lastCompletedStep = -1;
            
            result.data.forEach((status: any) => {
              const stepIndex = updatedSteps.findIndex(s => s.id === status.step_type);
              if (stepIndex !== -1 && status.status === 'completed') {
                updatedSteps[stepIndex].completed = true;
                updatedSteps[stepIndex].data = { recordCount: status.records_imported };
                lastCompletedStep = stepIndex;
              }
            });
            
            setSteps(updatedSteps);
            
            // Set current step to next incomplete step
            if (lastCompletedStep >= 0 && lastCompletedStep < updatedSteps.length - 1) {
              setCurrentStep(lastCompletedStep + 1);
              setUploadProgress(`Resuming from step ${lastCompletedStep + 2}: ${updatedSteps[lastCompletedStep + 1].title}`);
              setTimeout(() => setUploadProgress(null), 3000);
            }
          }
        }
      } catch (error) {
        console.error('Error checking import status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    if (projectId) {
      checkImportStatus();
    } else {
      setIsCheckingStatus(false);
    }
  }, [projectId]);

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

      // Process and store data BEFORE marking as complete
      if ('processedData' in validationResult) {
        try {
          setUploadProgress(`Saving ${validationResult.processedData.length} ${currentStepData.id} to database...`);
          
          const saveResult = await processStepData(projectId, currentStepData.id, validationResult.processedData);
          
          // Only mark as successful if data was actually saved
          if (!saveResult || !saveResult.success) {
            throw new Error('Database save failed');
          }
          
          console.log(`Successfully saved ${validationResult.processedData.length} ${currentStepData.id} to database`);
          setUploadProgress(null);
          
          // NOW update step as completed after successful save
          const updatedSteps = [...steps];
          updatedSteps[currentStep] = {
            ...currentStepData,
            file,
            data: validationResult.processedData,
            completed: true
          };
          setSteps(updatedSteps);
        } catch (saveError) {
          // If save fails, don't mark the step as completed
          setUploadError(`Failed to save to database: ${saveError.message}`);
          setUploadProgress(null);
          setIsUploading(false);
          return;
        }
      } else {
        // If no data to process (e.g., for other step types), just mark as complete
        const updatedSteps = [...steps];
        updatedSteps[currentStep] = {
          ...currentStepData,
          file,
          data: [],
          completed: true
        };
        setSteps(updatedSteps);
      }

      setIsUploading(false);
    } catch (error) {
      log.error('Error uploading file:', { data: error }, 'SOWUploadWizard');
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

  if (isCheckingStatus) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg">Checking import status for {projectName}...</p>
          </div>
        </div>
      </div>
    );
  }

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
          uploadProgress={uploadProgress}
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