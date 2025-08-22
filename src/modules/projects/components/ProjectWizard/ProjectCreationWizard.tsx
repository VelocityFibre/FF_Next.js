import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateProject } from '../../hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useProjectManagers } from '@/hooks/useStaff';
import { WizardHeader } from './WizardHeader';
import { WizardNavigation } from './WizardNavigation';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
import { SOWUploadStep } from './steps/SOWUploadStep';
import { ReviewStep } from './steps/ReviewStep';
import type { FormData } from './types';
import { ProjectPriority } from '../../types/project.types';

export function ProjectCreationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectCreated, setProjectCreated] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string>();

  const form = useForm<FormData>({
    defaultValues: {
      priority: ProjectPriority.MEDIUM,
    }
  });

  const { data: clients = [], isLoading: isClientsLoading } = useClients();
  const { data: projectManagers = [], isLoading: isProjectManagersLoading } = useProjectManagers();
  const createProject = useCreateProject();

  const handleNext = () => {
    if (currentStep < 3) {
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
      const projectId = await createProject.mutateAsync(formData);
      setCreatedProjectId(projectId);
      setProjectCreated(true);
      setCurrentStep(2); // Move to SOW upload step
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleFinish = () => {
    navigate('/app/projects');
  };

  const selectedClient = clients?.find(c => c.id === form.watch('clientId'));
  const selectedProjectManager = projectManagers?.find(pm => pm.id === form.watch('projectManagerId'));

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            form={form}
            clients={clients?.map(c => ({ id: c.id!, name: c.name })) || []}
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
        return <SOWUploadStep projectId={createdProjectId!} />;
      case 3:
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
          onSubmit={currentStep === 3 ? handleSubmit : handleFinish}
          isSubmitting={createProject.isPending}
          isLastStep={currentStep === 3 || (currentStep === 2 && projectCreated)}
        />
      </form>
    </div>
  );
}