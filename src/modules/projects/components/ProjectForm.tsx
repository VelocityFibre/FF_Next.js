import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Save, 
  X, 
  Calendar,
  MapPin,
  DollarSign,
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  useCreateProject, 
  useUpdateProject, 
  useProject 
} from '../hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useStaff } from '@/hooks/useStaff';
import { 
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectPriority,
  ProjectStatus
} from '../types/project.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/cn';

type FormData = CreateProjectRequest & {
  status?: ProjectStatus;
};

export function ProjectForm() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const isEditMode = !!projectId;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: project, isLoading: projectLoading } = useProject(projectId || '');
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: staff, isLoading: staffLoading } = useStaff({ position: 'Project Manager' });
  
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      priority: ProjectPriority.MEDIUM,
      location: {
        province: 'Western Cape',
      },
    },
  });

  // Load project data in edit mode
  useEffect(() => {
    if (isEditMode && project) {
      reset({
        name: project.name,
        description: project.description,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
        location: project.location,
        clientId: project.clientId,
        projectManagerId: project.projectManagerId,
        priority: project.priority,
        status: project.status,
        budget: project.budget,
      });
    }
  }, [isEditMode, project, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        await updateProject.mutateAsync({
          id: projectId,
          ...data,
        } as UpdateProjectRequest);
      } else {
        const newProjectId = await createProject.mutateAsync(data);
        navigate(`/app/projects/${newProjectId}`);
        return;
      }
      
      navigate('/app/projects');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/app/projects');
  };

  if (isEditMode && projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading project..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-text-secondary">
            {isEditMode 
              ? 'Update project details and configuration'
              : 'Set up a new fibre installation project'}
          </p>
        </div>

        {/* Basic Information */}
        <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
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

            <div className="md:col-span-2">
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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
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
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
                <input
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 border rounded-lg bg-background-primary text-text-primary",
                    "focus:outline-none focus:ring-2",
                    errors.endDate 
                      ? "border-error-500 focus:ring-error-500" 
                      : "border-border-primary focus:ring-border-focus"
                  )}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-error-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Address *
              </label>
              <input
                {...register('location.address', { required: 'Address is required' })}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg bg-background-primary text-text-primary",
                  "placeholder-text-tertiary focus:outline-none focus:ring-2",
                  errors.location?.address 
                    ? "border-error-500 focus:ring-error-500" 
                    : "border-border-primary focus:ring-border-focus"
                )}
                placeholder="Enter project address"
              />
              {errors.location?.address && (
                <p className="mt-1 text-sm text-error-600">{errors.location.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                City *
              </label>
              <input
                {...register('location.city', { required: 'City is required' })}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg bg-background-primary text-text-primary",
                  "placeholder-text-tertiary focus:outline-none focus:ring-2",
                  errors.location?.city 
                    ? "border-error-500 focus:ring-error-500" 
                    : "border-border-primary focus:ring-border-focus"
                )}
                placeholder="Enter city"
              />
              {errors.location?.city && (
                <p className="mt-1 text-sm text-error-600">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Province *
              </label>
              <select
                {...register('location.province', { required: 'Province is required' })}
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
                Postal Code
              </label>
              <input
                {...register('location.postalCode')}
                className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="Enter postal code"
              />
            </div>
          </div>
        </div>

        {/* Client & Team */}
        <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Client & Team
          </h2>
          
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
                disabled={clientsLoading}
              >
                <option value="">Select a client</option>
                {clients?.map((client: any) => (
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
                disabled={staffLoading}
              >
                <option value="">Select a project manager</option>
                {staff?.map((member: any) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
              {errors.projectManagerId && (
                <p className="mt-1 text-sm text-error-600">{errors.projectManagerId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Priority *
              </label>
              <select
                {...register('priority')}
                className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              >
                <option value={ProjectPriority.LOW}>Low</option>
                <option value={ProjectPriority.MEDIUM}>Medium</option>
                <option value={ProjectPriority.HIGH}>High</option>
                <option value={ProjectPriority.CRITICAL}>Critical</option>
              </select>
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value={ProjectStatus.PLANNING}>Planning</option>
                  <option value={ProjectStatus.ACTIVE}>Active</option>
                  <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                  <option value={ProjectStatus.COMPLETED}>Completed</option>
                  <option value={ProjectStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-border-primary rounded-lg font-medium text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "px-6 py-2 rounded-lg font-medium text-white transition-colors",
              "bg-primary-600 hover:bg-primary-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center space-x-2"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditMode ? 'Update' : 'Create'} Project</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}