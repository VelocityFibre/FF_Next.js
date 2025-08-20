import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, 
  ArrowRight, ArrowLeft, Download, Eye, MapPin, Home, Cable 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  PoleImportRow, 
  DropImportRow, 
  FiberImportRow,
  ImportBatch,
  ImportError
} from '../tracker/types/tracker.types';
import { sowTrackerService } from './services/sowTrackerService';

interface SOWImportManagerProps {
  projectId: string;
  projectName: string;
  projectCode: string;
  onComplete?: () => void;
}

interface ImportStep {
  id: 'poles' | 'drops' | 'fiber' | 'review' | 'complete';
  title: string;
  description: string;
  icon: any;
  color: string;
}

export function SOWImportManager({ projectId, projectName, projectCode, onComplete }: SOWImportManagerProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<ImportError[]>([]);
  
  // Data states
  const [polesData, setPolesData] = useState<PoleImportRow[]>([]);
  const [dropsData, setDropsData] = useState<DropImportRow[]>([]);
  const [fiberData, setFiberData] = useState<FiberImportRow[]>([]);
  const [importBatch, setImportBatch] = useState<ImportBatch | null>(null);

  const steps: ImportStep[] = [
    {
      id: 'poles',
      title: 'Import Poles',
      description: 'Upload Excel file with pole locations and details',
      icon: MapPin,
      color: 'bg-blue-500'
    },
    {
      id: 'drops',
      title: 'Import Home Drops',
      description: 'Upload Excel file with home drop connections',
      icon: Home,
      color: 'bg-green-500'
    },
    {
      id: 'fiber',
      title: 'Import Fiber Sections',
      description: 'Upload Excel file with fiber cable routes',
      icon: Cable,
      color: 'bg-purple-500'
    },
    {
      id: 'review',
      title: 'Review & Validate',
      description: 'Review imported data and fix any issues',
      icon: Eye,
      color: 'bg-orange-500'
    },
    {
      id: 'complete',
      title: 'Complete Import',
      description: 'Finalize and create trackers',
      icon: CheckCircle,
      color: 'bg-green-600'
    }
  ];

  const currentStepData = steps[currentStep];

  // Download template
  const downloadTemplate = (type: 'poles' | 'drops' | 'fiber') => {
    let headers: string[] = [];
    let sampleData: any[] = [];

    switch (type) {
      case 'poles':
        headers = ['poleNumber', 'location', 'latitude', 'longitude', 'poleType', 'height', 'zone', 'pon', 'contractorName', 'teamName', 'plannedDate', 'status'];
        sampleData = [
          {
            poleNumber: 'P001',
            location: 'Lawley Ext 3, Stand 123',
            latitude: -25.7479,
            longitude: 28.2293,
            poleType: 'wooden',
            height: 9,
            zone: 'Zone A',
            pon: 'PON-01',
            contractorName: 'ABC Contractors',
            teamName: 'Team 1',
            plannedDate: '2025-09-01',
            status: 'Planned'
          }
        ];
        break;
      case 'drops':
        headers = ['dropNumber', 'poleNumber', 'homeNumber', 'customerName', 'address', 'latitude', 'longitude', 'cableLength', 'serviceType', 'status'];
        sampleData = [
          {
            dropNumber: 'D001',
            poleNumber: 'P001',
            homeNumber: 'H123',
            customerName: 'John Doe',
            address: '123 Main St, Lawley',
            latitude: -25.7480,
            longitude: 28.2294,
            cableLength: 50,
            serviceType: 'residential',
            status: 'Planned'
          }
        ];
        break;
      case 'fiber':
        headers = ['sectionId', 'fromLocation', 'toLocation', 'fromPole', 'toPole', 'cableType', 'cableLength', 'coreCount', 'installationMethod', 'status'];
        sampleData = [
          {
            sectionId: 'F001',
            fromLocation: 'Junction Box A',
            toLocation: 'Pole P001',
            fromPole: '',
            toPole: 'P001',
            cableType: '24-core',
            cableLength: 500,
            coreCount: 24,
            installationMethod: 'aerial',
            status: 'Planned'
          }
        ];
        break;
    }

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Download
    XLSX.writeFile(wb, `${type}_template.xlsx`);
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Process based on current step
      switch (currentStepData.id) {
        case 'poles':
          const validatedPoles = await validatePolesData(data as PoleImportRow[]);
          setPolesData(validatedPoles.valid);
          setErrors(validatedPoles.errors);
          break;
        case 'drops':
          const validatedDrops = await validateDropsData(data as DropImportRow[], polesData);
          setDropsData(validatedDrops.valid);
          setErrors(validatedDrops.errors);
          break;
        case 'fiber':
          const validatedFiber = await validateFiberData(data as FiberImportRow[], polesData);
          setFiberData(validatedFiber.valid);
          setErrors(validatedFiber.errors);
          break;
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing file:', error);
      setErrors([{
        row: 0,
        type: 'pole',
        identifier: 'File',
        error: 'Failed to process file. Please check the format.'
      }]);
      setIsProcessing(false);
    }
  };

  // Validation functions
  const validatePolesData = async (data: PoleImportRow[]) => {
    const valid: PoleImportRow[] = [];
    const errors: ImportError[] = [];
    const poleNumbers = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Check required fields
      if (!row.poleNumber) {
        errors.push({
          row: i + 2,
          type: 'pole',
          identifier: `Row ${i + 2}`,
          error: 'Pole number is required'
        });
        continue;
      }

      // Check unique pole number
      if (poleNumbers.has(row.poleNumber)) {
        errors.push({
          row: i + 2,
          type: 'pole',
          identifier: row.poleNumber,
          error: 'Duplicate pole number in file'
        });
        continue;
      }

      // Check if pole number already exists in database
      const exists = await sowTrackerService.checkPoleNumberExists(row.poleNumber);
      if (exists) {
        errors.push({
          row: i + 2,
          type: 'pole',
          identifier: row.poleNumber,
          error: 'Pole number already exists in system'
        });
        continue;
      }

      poleNumbers.add(row.poleNumber);
      valid.push(row);
    }

    return { valid, errors };
  };

  const validateDropsData = async (data: DropImportRow[], poles: PoleImportRow[]) => {
    const valid: DropImportRow[] = [];
    const errors: ImportError[] = [];
    const dropNumbers = new Set<string>();
    const poleNumbers = new Set(poles.map(p => p.poleNumber));
    const poleDropCounts = new Map<string, number>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Check required fields
      if (!row.dropNumber) {
        errors.push({
          row: i + 2,
          type: 'drop',
          identifier: `Row ${i + 2}`,
          error: 'Drop number is required'
        });
        continue;
      }

      // Check unique drop number
      if (dropNumbers.has(row.dropNumber)) {
        errors.push({
          row: i + 2,
          type: 'drop',
          identifier: row.dropNumber,
          error: 'Duplicate drop number in file'
        });
        continue;
      }

      // Check if drop number already exists in database
      const exists = await sowTrackerService.checkDropNumberExists(row.dropNumber);
      if (exists) {
        errors.push({
          row: i + 2,
          type: 'drop',
          identifier: row.dropNumber,
          error: 'Drop number already exists in system'
        });
        continue;
      }

      // Validate pole connection
      if (row.poleNumber && !poleNumbers.has(row.poleNumber)) {
        errors.push({
          row: i + 2,
          type: 'drop',
          identifier: row.dropNumber,
          error: `Connected pole ${row.poleNumber} not found in poles data`
        });
        continue;
      }

      // Check max drops per pole (12)
      if (row.poleNumber) {
        const currentCount = poleDropCounts.get(row.poleNumber) || 0;
        if (currentCount >= 12) {
          errors.push({
            row: i + 2,
            type: 'drop',
            identifier: row.dropNumber,
            error: `Pole ${row.poleNumber} already has maximum 12 drops`
          });
          continue;
        }
        poleDropCounts.set(row.poleNumber, currentCount + 1);
      }

      dropNumbers.add(row.dropNumber);
      valid.push(row);
    }

    return { valid, errors };
  };

  const validateFiberData = async (data: FiberImportRow[], poles: PoleImportRow[]) => {
    const valid: FiberImportRow[] = [];
    const errors: ImportError[] = [];
    const sectionIds = new Set<string>();
    const poleNumbers = new Set(poles.map(p => p.poleNumber));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Check required fields
      if (!row.sectionId) {
        errors.push({
          row: i + 2,
          type: 'fiber',
          identifier: `Row ${i + 2}`,
          error: 'Section ID is required'
        });
        continue;
      }

      // Check unique section ID
      if (sectionIds.has(row.sectionId)) {
        errors.push({
          row: i + 2,
          type: 'fiber',
          identifier: row.sectionId,
          error: 'Duplicate section ID in file'
        });
        continue;
      }

      // Validate pole connections if specified
      if (row.fromPole && !poleNumbers.has(row.fromPole)) {
        errors.push({
          row: i + 2,
          type: 'fiber',
          identifier: row.sectionId,
          error: `From pole ${row.fromPole} not found in poles data`
        });
        continue;
      }

      if (row.toPole && !poleNumbers.has(row.toPole)) {
        errors.push({
          row: i + 2,
          type: 'fiber',
          identifier: row.sectionId,
          error: `To pole ${row.toPole} not found in poles data`
        });
        continue;
      }

      sectionIds.add(row.sectionId);
      valid.push(row);
    }

    return { valid, errors };
  };

  // Process final import
  const processImport = async () => {
    setIsProcessing(true);

    try {
      const batch = await sowTrackerService.createImportBatch(
        projectId,
        projectCode,
        projectName,
        {
          poles: polesData,
          drops: dropsData,
          fiber: fiberData
        }
      );

      setImportBatch(batch);
      setCurrentStep(4); // Move to complete step
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error processing import:', error);
      setErrors([{
        row: 0,
        type: 'pole',
        identifier: 'Import',
        error: 'Failed to process import. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SOW Data Import</h1>
        <p className="text-gray-600 mt-1">Import poles, drops, and fiber data for {projectName}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${index === currentStep ? step.color : 
                  index < currentStep ? 'bg-green-500' : 'bg-gray-300'}
                text-white
              `}>
                {index < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-full h-1 mx-2
                  ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div key={step.id} className={`text-xs ${index === currentStep ? 'font-semibold' : ''}`}>
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {currentStep < 3 ? (
          // Import steps
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{currentStepData.title}</h2>
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>

            {/* Template Download */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Need a template?</p>
                  <p className="text-sm text-blue-700">Download our Excel template with the correct format</p>
                </div>
                <button
                  onClick={() => downloadTemplate(currentStepData.id as 'poles' | 'drops' | 'fiber')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drop your Excel file here or click to browse</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id={`file-upload-${currentStep}`}
                disabled={isProcessing}
              />
              <label
                htmlFor={`file-upload-${currentStep}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Select File
              </label>
            </div>

            {/* Data Summary */}
            {currentStep === 0 && polesData.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Successfully loaded {polesData.length} poles
                </p>
              </div>
            )}
            {currentStep === 1 && dropsData.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Successfully loaded {dropsData.length} drops
                </p>
              </div>
            )}
            {currentStep === 2 && fiberData.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Successfully loaded {fiberData.length} fiber sections
                </p>
              </div>
            )}
          </div>
        ) : currentStep === 3 ? (
          // Review step
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Import Data</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{polesData.length}</p>
                    <p className="text-sm text-gray-600">Poles</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Home className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dropsData.length}</p>
                    <p className="text-sm text-gray-600">Home Drops</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Cable className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{fiberData.length}</p>
                    <p className="text-sm text-gray-600">Fiber Sections</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Summary */}
            {errors.length > 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Validation Errors Found</p>
                    <p className="text-sm text-red-700 mt-1">
                      {errors.length} errors need to be fixed before import
                    </p>
                    <div className="mt-3 max-h-40 overflow-y-auto">
                      {errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm text-red-600 mb-1">
                          • Row {error.row}: {error.error}
                        </div>
                      ))}
                      {errors.length > 5 && (
                        <div className="text-sm text-red-600 mt-2">
                          ... and {errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Validation Passed</p>
                    <p className="text-sm text-green-700">All data is valid and ready to import</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={processImport}
              disabled={errors.length > 0 || isProcessing}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {isProcessing ? 'Processing...' : 'Process Import'}
            </button>
          </div>
        ) : (
          // Complete step
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Import Complete!</h2>
            <p className="text-gray-600 mb-6">
              Successfully imported {polesData.length} poles, {dropsData.length} drops, and {fiberData.length} fiber sections
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(`/app/projects/${projectId}/tracker`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View in Tracker Grid
              </button>
              <button
                onClick={() => navigate(`/app/projects/${projectId}`)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Project
              </button>
            </div>
          </div>
        )}

        {/* Errors Display */}
        {errors.length > 0 && currentStep < 3 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Validation Errors</p>
                <div className="mt-2 text-sm text-red-700">
                  {errors.slice(0, 3).map((error, index) => (
                    <div key={index}>• Row {error.row}: {error.error}</div>
                  ))}
                  {errors.length > 3 && <div>... and {errors.length - 3} more</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={
              (currentStep === 0 && polesData.length === 0) ||
              (currentStep === 1 && dropsData.length === 0) ||
              (currentStep === 2 && fiberData.length === 0) ||
              currentStep === 3
            }
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}