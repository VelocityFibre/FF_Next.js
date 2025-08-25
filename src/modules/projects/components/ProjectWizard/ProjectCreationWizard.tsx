import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
// import { useCreateNeonProject, useConvertFirebaseToNeon } from '@/hooks/neon/useNeonProjects';
// import { useNeonActiveClients } from '@/hooks/neon/useNeonClients';
// import { useNeonProjectManagers } from '@/hooks/neon/useNeonStaff';
import { WizardHeader } from './WizardHeader';
import { WizardNavigation } from './WizardNavigation';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
// import { SOWUploadStep } from './steps/SOWUploadStep';
import { ReviewStep } from './steps/ReviewStep';
import type { FormData } from './types';
import { ProjectPriority } from '../../types/project.types';

export function ProjectCreationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  // const [projectCreated, setProjectCreated] = useState(false);
  // const [createdProjectId, setCreatedProjectId] = useState<string>();

  const form = useForm<FormData>({
    defaultValues: {
      priority: ProjectPriority.MEDIUM,
    }
  });

  // TODO: Fix these hooks when Neon integration is ready
  const clients: any[] = [];
  const projectManagers: any[] = [];
  const isClientsLoading = false;
  const isProjectManagersLoading = false;
  
  // const { data: clients = [], isLoading: isClientsLoading } = useNeonActiveClients();
  // const { data: projectManagers = [], isLoading: isProjectManagersLoading } = useNeonProjectManagers();
  // const createProject = useCreateNeonProject();
  // const convertToNeon = useConvertFirebaseToNeon();

  const handleNext = () => {
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
      // TODO: Implement project creation when Neon integration is ready
      // const project = await createProject.mutateAsync(formData);
      // console.log('Project created successfully:', project);
      
      // For now, just navigate back
      navigate('/app/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
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
            clients={clients?.map((c: any) => ({ id: c.id!, name: c.name })) || []}
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
            clientName={selectedClient?.name || 'Unknown'}
            projectManagerName={selectedProjectManager?.name || 'Unassigned'}
          />
        );
      default:
        return null;
    }
  };

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
          isSubmitting={false}
          isLastStep={currentStep === 2}
        />
      </form>
    </div>
  );
}