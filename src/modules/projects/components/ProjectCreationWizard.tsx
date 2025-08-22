import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  FolderOpen,
  MapPin,
  Calendar,
  SkipForward
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCreateProject } from '../hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useProjectManagers } from '@/hooks/useStaff';
import { SOWUploadSection } from './SOWUploadSection';
import { 
  CreateProjectRequest,
  ProjectPriority
} from '../types/project.types';
import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type FormData = CreateProjectRequest;

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  component: 'basic' | 'details' | 'sow' | 'review';
}

const wizardSteps: WizardStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Project name, client, and timeline',
    icon: FolderOpen,
    component: 'basic'
  },
  {
    id: 'details',
    title: 'Project Details',
    description: 'Location, budget, and team assignment',
    icon: MapPin,
    component: 'details'
  },
  {
    id: 'sow',
    title: 'Import SOW Data',
    description: 'Upload poles, drops, and fibre scope (optional)',
    icon: FileSpreadsheet,
    component: 'sow'
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review project details and create',
    icon: CheckCircle,
    component: 'review'
  }
];

export function ProjectCreationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectCreated, setProjectCreated] = useState<string | null>(null);
  const [sowData, setSOWData] = useState<{
    poles?: any[];
    drops?: any[];
    fibre?: any[];
  }>({});
  const [duration, setDuration] = useState<number>(6); // Default 6 months
  const [calculatedEndDate, setCalculatedEndDate] = useState<string>('');

  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: projectManagers, isLoading: managersLoading } = useProjectManagers();
  const createProject = useCreateProject();

  const {
    register,
    formState: { errors },
    watch,
    getValues,
    trigger,
    setValue
  } = useForm<FormData>({
    defaultValues: {
      priority: ProjectPriority.MEDIUM,
      location: {
        province: 'Western Cape',
      },
    },
  });

  const formValues = watch();
  const startDate = watch('startDate');

  // Calculate end date when start date or duration changes
  useEffect(() => {
    if (startDate && duration) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + duration);
      
      // Format as YYYY-MM-DD for input[type="date"]
      const endDateString = end.toISOString().split('T')[0];
      setCalculatedEndDate(endDateString);
      setValue('endDate', endDateString);
    }
  }, [startDate, duration, setValue]);

  const handleNext = async () => {
    // Validate current step
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (currentStep === 2 && !projectCreated) {
      // Create project before SOW step
      await createProjectWithoutSOW();
    } else if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 0: // Basic info
        return await trigger(['name', 'clientId', 'startDate', 'endDate']);
      case 1: // Details
        return await trigger(['location', 'projectManagerId', 'budget']);
      case 2: // SOW (optional)
        return true;
      default:
        return true;
    }
  };

  const createProjectWithoutSOW = async () => {
    setIsSubmitting(true);
    try {
      const data = getValues();
      const projectId = await createProject.mutateAsync(data);
      setProjectCreated(projectId);
      setCurrentStep(2); // Move to SOW step
    } catch (error) {
      console.error('Error creating project:', error);
      setIsSubmitting(false);
    }
  };

  const handleSkipSOW = async () => {
    if (projectCreated) {
      // Project already created, navigate to project details
      navigate(`/app/projects/${projectCreated}`);
    } else {
      // Create project without SOW
      setIsSubmitting(true);
      try {
        const data = getValues();
        const projectId = await createProject.mutateAsync(data);
        navigate(`/app/projects/${projectId}`);
      } catch (error) {
        console.error('Error creating project:', error);
        setIsSubmitting(false);
      }
    }
  };

  const handleSOWComplete = () => {
    // SOW data uploaded successfully, move to review
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    if (projectCreated) {
      // Project already created with SOW data
      navigate(`/app/projects/${projectCreated}`);
    }
  };

  if (clientsLoading || managersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading resources..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {wizardSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep || (index === 2 && projectCreated);
            
            return (
              <div key={step.id} className="flex-1 relative">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors",
                      isActive ? "border-primary-500 bg-primary-500 text-white" :
                      isCompleted ? "border-success-500 bg-success-500 text-white" :
                      "border-border-secondary bg-surface-primary text-text-tertiary"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  
                  {index < wizardSteps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2">
                      <div className={cn(
                        "h-full transition-colors",
                        index < currentStep ? "bg-success-500" : "bg-border-secondary"
                      )} />
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <p className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary-600" : "text-text-secondary"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Basic Project Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Project Name *
              </label>
              <input
                {...register('name', { required: 'Project name is required' })}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg bg-background-primary text-text-primary",
                  "placeholder-text-tertiary focus:outline-none focus:ring-2",
                  errors.name 
                    ? "border-error-500 focus:ring-error-500" 
                    : "border-border-primary focus:ring-border-focus"
                )}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="Enter project description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Client *
                </label>
                <select
                  {...register('clientId', { required: 'Client is required' })}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg bg-background-primary text-text-primary",
                    "focus:outline-none focus:ring-2",
                    errors.clientId 
                      ? "border-error-500 focus:ring-error-500" 
                      : "border-border-primary focus:ring-border-focus"
                  )}
                >
                  <option value="">Select client</option>
                  {clients?.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-error-600">{errors.clientId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value={ProjectPriority.LOW}>Low</option>
                  <option value={ProjectPriority.MEDIUM}>Medium</option>
                  <option value={ProjectPriority.HIGH}>High</option>
                  <option value={ProjectPriority.HIGH}>High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    {...register('startDate', { required: 'Start date is required' })}
                    type="date"
                    className={cn(
                      "w-full pl-10 pr-4 py-2 border rounded-lg bg-background-primary text-text-primary",
                      "focus:outline-none focus:ring-2",
                      errors.startDate 
                        ? "border-error-500 focus:ring-error-500" 
                        : "border-border-primary focus:ring-border-focus"
                    )}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-error-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                  placeholder="Enter duration in months"
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Project duration in months
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  End Date (Calculated)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    {...register('endDate', { required: 'End date is required' })}
                    type="date"
                    value={calculatedEndDate}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-surface-secondary text-text-secondary cursor-not-allowed"
                  />
                </div>
                {startDate && duration && (
                  <p className="mt-1 text-xs text-text-secondary">
                    Auto-calculated based on start date and duration
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Project Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Project Manager *
              </label>
              <select
                {...register('projectManagerId', { required: 'Project manager is required' })}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg bg-background-primary text-text-primary",
                  "focus:outline-none focus:ring-2",
                  errors.projectManagerId 
                    ? "border-error-500 focus:ring-error-500" 
                    : "border-border-primary focus:ring-border-focus"
                )}
              >
                <option value="">
                  {managersLoading ? 'Loading managers...' : 'Select project manager'}
                </option>
                {!managersLoading && projectManagers?.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} {manager.currentProjectCount && manager.maxProjectCount ? 
                      `(${manager.currentProjectCount}/${manager.maxProjectCount} projects)` : ''}
                  </option>
                ))}
              </select>
              {errors.projectManagerId && (
                <p className="mt-1 text-sm text-error-600">{errors.projectManagerId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Province
                </label>
                <select
                  {...register('location.province')}
                  className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value="Western Cape">Western Cape</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="North West">North West</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  City
                </label>
                <input
                  {...register('location.city')}
                  className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Address
                </label>
                <input
                  {...register('location.address')}
                  className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus"
                  placeholder="Enter project address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Budget (ZAR)
                </label>
                <input
                  {...register('budget', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Budget must be positive' }
                  })}
                  type="number"
                  className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus"
                  placeholder="Enter project budget"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-error-600">{errors.budget.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  Import SOW Data (Optional)
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Upload Excel files containing poles, drops, and fibre scope data
                </p>
              </div>
              
              <button
                onClick={handleSkipSOW}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip for now
              </button>
            </div>

            {projectCreated ? (
              <SOWUploadSection
                projectId={projectCreated}
                projectName={formValues.name}
                onComplete={handleSOWComplete}
                onDataUpdate={setSOWData}
              />
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-text-secondary">Creating project...</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Review Project Details
            </h2>

            <div className="bg-background-secondary rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-tertiary">Project Name</p>
                  <p className="font-medium text-text-primary">{formValues.name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Client</p>
                  <p className="font-medium text-text-primary">
                    {clients?.find(c => c.id === formValues.clientId)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Start Date</p>
                  <p className="font-medium text-text-primary">{formValues.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">End Date</p>
                  <p className="font-medium text-text-primary">{formValues.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Location</p>
                  <p className="font-medium text-text-primary">
                    {[formValues.location?.address, formValues.location?.city, formValues.location?.province]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Priority</p>
                  <p className="font-medium text-text-primary capitalize">{formValues.priority}</p>
                </div>
              </div>

              {(sowData.poles || sowData.drops || sowData.fibre) && (
                <div className="border-t border-border-primary pt-4">
                  <p className="text-sm font-medium text-text-primary mb-2">SOW Data Imported</p>
                  <div className="flex items-center gap-4 text-sm">
                    {sowData.poles && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-success-500" />
                        <span className="text-text-secondary">{sowData.poles.length} poles</span>
                      </div>
                    )}
                    {sowData.drops && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-success-500" />
                        <span className="text-text-secondary">{sowData.drops.length} drops</span>
                      </div>
                    )}
                    {sowData.fibre && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-success-500" />
                        <span className="text-text-secondary">{sowData.fibre.length} segments</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                <div>
                  <p className="font-medium text-success-900">Ready to go!</p>
                  <p className="text-sm text-success-700 mt-1">
                    Your project has been created successfully. Click below to view the project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-primary">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className={cn(
              "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              currentStep === 0 || isSubmitting
                ? "text-text-tertiary bg-surface-secondary cursor-not-allowed"
                : "text-text-primary bg-surface-primary border border-border-primary hover:bg-surface-secondary"
            )}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep === wizardSteps.length - 1 ? (
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-success-600 rounded-lg hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    View Project
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}