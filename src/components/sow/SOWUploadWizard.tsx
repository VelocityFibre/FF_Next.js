import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SOWUploadStep {
  id: 'poles' | 'drops' | 'fibre';
  title: string;
  description: string;
  completed: boolean;
  file?: File;
  data?: any[];
}

interface SOWUploadWizardProps {
  projectId: string;
  projectName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function SOWUploadWizard({ projectId, projectName, onComplete }: SOWUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [steps, setSteps] = useState<SOWUploadStep[]>([
    {
      id: 'poles',
      title: 'Upload Poles Data',
      description: 'Upload Excel file containing pole information (coordinates, pole numbers, etc.)',
      completed: false
    },
    {
      id: 'drops',
      title: 'Upload Drops Data',
      description: 'Upload Excel file containing drop information (drop numbers, addresses, pole assignments)',
      completed: false
    },
    {
      id: 'fibre',
      title: 'Upload Fibre Data',
      description: 'Upload Excel file containing fibre information (cable lengths, trenching/stringing distances)',
      completed: false
    }
  ]);

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

  const validateStepData = (stepType: string, data: any[]) => {
    if (!data || data.length === 0) {
      return { isValid: false, error: 'File is empty or invalid format' };
    }

    switch (stepType) {
      case 'poles':
        return validatePolesData(data);
      case 'drops':
        return validateDropsData(data);
      case 'fibre':
        return validateFibreData(data);
      default:
        return { isValid: false, error: 'Unknown step type' };
    }
  };

  const validatePolesData = (data: any[]) => {
    const requiredFields = ['pole_number', 'latitude', 'longitude'];
    const firstRow = data[0];
    
    const missingFields = requiredFields.filter(field => 
      !Object.keys(firstRow).some(key => key.toLowerCase().includes(field.replace('_', '').toLowerCase()))
    );

    if (missingFields.length > 0) {
      return { 
        isValid: false, 
        error: `Missing required columns for poles: ${missingFields.join(', ')}` 
      };
    }

    const processedData = data.map(row => ({
      pole_number: findColumnValue(row, ['pole_number', 'pole number', 'pole_id', 'pole id']),
      latitude: parseFloat(findColumnValue(row, ['latitude', 'lat', 'coord_lat'])) || 0,
      longitude: parseFloat(findColumnValue(row, ['longitude', 'lng', 'long', 'coord_lng'])) || 0,
      max_drops: parseInt(findColumnValue(row, ['max_drops', 'capacity', 'max_capacity'])) || 12,
      current_drops: 0,
      status: findColumnValue(row, ['status']) || 'planned'
    })).filter(item => item.pole_number);

    return { isValid: true, processedData };
  };

  const validateDropsData = (data: any[]) => {
    const requiredFields = ['drop_number', 'pole_number', 'address'];
    const firstRow = data[0];
    
    const missingFields = requiredFields.filter(field => 
      !Object.keys(firstRow).some(key => key.toLowerCase().includes(field.replace('_', '').toLowerCase()))
    );

    if (missingFields.length > 0) {
      return { 
        isValid: false, 
        error: `Missing required columns for drops: ${missingFields.join(', ')}` 
      };
    }

    const processedData = data.map(row => ({
      drop_number: findColumnValue(row, ['drop_number', 'drop number', 'drop_id', 'drop id']),
      pole_number: findColumnValue(row, ['pole_number', 'pole number', 'pole_id', 'pole id']),
      address: findColumnValue(row, ['address', 'installation_address', 'location']),
      status: findColumnValue(row, ['status']) || 'planned'
    })).filter(item => item.drop_number);

    return { isValid: true, processedData };
  };

  const validateFibreData = (data: any[]) => {
    const requiredFields = ['segment_id', 'from_point', 'to_point', 'distance'];
    const firstRow = data[0];
    
    const missingFields = requiredFields.filter(field => 
      !Object.keys(firstRow).some(key => key.toLowerCase().includes(field.replace('_', '').toLowerCase()))
    );

    if (missingFields.length > 0) {
      return { 
        isValid: false, 
        error: `Missing required columns for fibre: ${missingFields.join(', ')}` 
      };
    }

    const processedData = data.map(row => ({
      segment_id: findColumnValue(row, ['segment_id', 'segment id', 'cable_id', 'cable id']),
      from_point: findColumnValue(row, ['from_point', 'from point', 'start_point', 'start point']),
      to_point: findColumnValue(row, ['to_point', 'to point', 'end_point', 'end point']),
      distance: parseFloat(findColumnValue(row, ['distance', 'length', 'cable_length', 'metres', 'meters'])) || 0,
      cable_type: findColumnValue(row, ['cable_type', 'type']) || 'standard',
      status: findColumnValue(row, ['status']) || 'planned'
    })).filter(item => item.segment_id && item.distance > 0);

    return { isValid: true, processedData };
  };

  const findColumnValue = (row: any, possibleColumns: string[]): string => {
    for (const col of possibleColumns) {
      const key = Object.keys(row).find(k => 
        k.toLowerCase().replace(/[_\s]/g, '') === col.toLowerCase().replace(/[_\s]/g, '')
      );
      if (key && row[key] !== undefined && row[key] !== null) {
        return String(row[key]).trim();
      }
    }
    return '';
  };

  const processStepData = async (projectId: string, stepType: string, data: any[]) => {
    // Here we would normally save to Neon database
    // For now, we'll store in localStorage for demo purposes
    const storageKey = `sow_${projectId}_${stepType}`;
    localStorage.setItem(storageKey, JSON.stringify({
      projectId,
      stepType,
      data,
      uploadedAt: new Date().toISOString()
    }));
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

  const isCurrentStepComplete = steps[currentStep]?.completed;
  const allStepsComplete = steps.every(step => step.completed);

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
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step.completed ? 'text-green-600' : index === currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-4 mr-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isCurrentStepComplete ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {isCurrentStepComplete ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Upload Area */}
          {!isCurrentStepComplete && (
            <div className="max-w-md mx-auto">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className={`cursor-pointer ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {isUploading ? 'Processing file...' : 'Click to upload Excel file'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                </label>
              </div>

              {uploadError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Upload Error</p>
                    <p className="text-red-700 text-sm mt-1">{uploadError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success State */}
          {isCurrentStepComplete && currentStepData.file && (
            <div className="max-w-md mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">File uploaded successfully!</p>
                <p className="text-green-700 text-sm mt-1">
                  {currentStepData.file.name}
                </p>
                <p className="text-green-700 text-sm">
                  {currentStepData.data?.length || 0} records processed
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleSkipAll}
            className="text-gray-600 hover:text-gray-800"
          >
            Skip All & Continue
          </button>

          <div className="flex items-center gap-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentStepComplete}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={onComplete}
                disabled={!allStepsComplete}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Project Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}