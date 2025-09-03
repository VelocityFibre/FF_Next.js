import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle, FileSpreadsheet, ArrowRight, Folder } from 'lucide-react';
import { useActiveClients } from '@/hooks/useClients';
import { useProjectManagers } from '@/hooks/useStaff';
import { useCreateProject } from '@/hooks/useProjects';
import { WizardHeader } from './WizardHeader';
import { WizardNavigation } from './WizardNavigation';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
// import { SOWUploadStep } from './steps/SOWUploadStep';
import { ReviewStep } from './steps/ReviewStep';
import type { FormData } from './types';
import { ProjectPriority } from '../../types/project.types';
import { log } from '@/lib/logger';

export function ProjectCreationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string>();

  const form = useForm<FormData>({
    defaultValues: {
      priority: ProjectPriority.MEDIUM,
    }
  });

  // Fetch clients and project managers from Neon database
  const { data: clients = [], isLoading: isClientsLoading } = useActiveClients();
  const { data: projectManagers = [], isLoading: isProjectManagersLoading } = useProjectManagers();
  const createProject = useCreateProject();

  const handleNext = () => {
    const formData = form.getValues();
    
    // Validate step 0 (Basic Info)
    if (currentStep === 0) {
      if (!formData.name) {
        alert('Please enter a project name');
        return;
      }
      if (!formData.clientId) {
        alert('Please select a client');
        return;
      }
    }
    
    // Validate step 1 (Project Details)
    if (currentStep === 1) {
      if (!formData.projectManagerId) {
        alert('Please select a project manager');
        return;
      }
    }
    
    if (currentStep < 2) { // Only go to review step (step 2)
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = form.getValues();
      
      // Validate required fields
      if (!formData.clientId) {
        alert('Please select a client');
        return;
      }
      
      if (!formData.name) {
        alert('Please enter a project name');
        return;
      }
      
      // Calculate end date if not set
      const startDate = formData.startDate;
      let endDate = formData.endDate;
      
      if (!endDate && startDate && formData.durationMonths) {
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + formData.durationMonths);
        endDate = start.toISOString().split('T')[0];
      }
      
      // Map form data to project format (service will convert to snake_case)
      const projectData = {
        name: formData.name,
        projectName: formData.name, // Some parts expect projectName
        projectCode: `PRJ-${Date.now()}`, // Generate a simple project code
        clientId: formData.clientId,
        description: formData.description || formData.notes || '',
        projectType: 'installation', // Default type
        status: formData.status || 'planning',
        priority: formData.priority,
        startDate: startDate,
        endDate: endDate || startDate, // Use start date if end date is not available
        budget: formData.budget?.totalBudget || 0,
        projectManager: formData.projectManagerId,
        location: formData.location || null // Don't stringify, send as object or null
      };
      
      console.log('Submitting project data:', projectData); // Debug log
      console.log('Form data details:', {
        name: formData.name,
        clientId: formData.clientId,
        projectManagerId: formData.projectManagerId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        budget: formData.budget
      });
      const result = await createProject.mutateAsync(projectData as any);
      log.info('Project created successfully:', { data: result }, 'ProjectCreationWizard');
      
      // Store the created project ID and show success
      setCreatedProjectId(result.id || result);
      setShowSuccess(true);
    } catch (error) {
      console.error('Project creation error:', error); // Debug log
      log.error('Failed to create project:', { data: error }, 'ProjectCreationWizard');
      alert(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFinish = () => {
    navigate('/app/projects');
  };

  const selectedClient = clients?.find((c: any) => c.id === form.watch('clientId'));
  const selectedProjectManager = projectManagers?.find((pm: any) => pm.id === form.watch('projectManagerId'));

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            form={form}
            clients={clients?.map((c: any) => ({ id: c.id!, name: c.companyName })) || []}
            isClientsLoading={isClientsLoading}
          />
        );
      case 1:
        return (
          <ProjectDetailsStep
            form={form}
            projectManagers={projectManagers}
            isProjectManagersLoading={isProjectManagersLoading}
          />
        );
      case 2:
        return (
          <ReviewStep
            form={form}
            clientName={selectedClient?.companyName || 'Unknown'}
            projectManagerName={selectedProjectManager?.name || 'Unassigned'}
          />
        );
      default:
        return null;
    }
  };

  // Show success message if project was created
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project Created Successfully!
          </h2>
          
          <p className="text-gray-600 mb-8">
            Your project has been created. You can now import the Statement of Work (SOW) 
            to populate project specifications.
          </p>
          
          <div className="space-y-4">
            <Link
              to={`/app/sow-management?projectId=${createdProjectId}`}
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Import SOW from Excel
            </Link>
            
            <Link
              to={`/app/projects/${createdProjectId}`}
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Folder className="h-5 w-5 mr-2" />
              View Project Details
            </Link>
            
            <button
              onClick={() => navigate('/app/projects')}
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Go to Projects List
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Importing SOW data will automatically create poles, drops, 
              and fiber specifications for your project, saving you time on manual data entry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <WizardHeader currentStep={currentStep} />
      
      <form className="bg-white shadow-lg rounded-lg p-6">
        {renderStepContent()}
        
        <WizardNavigation
          currentStep={currentStep}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={currentStep === 2 ? handleSubmit : handleFinish}
          isSubmitting={createProject.isPending}
          isLastStep={currentStep === 2}
        />
      </form>
    </div>
  );
}