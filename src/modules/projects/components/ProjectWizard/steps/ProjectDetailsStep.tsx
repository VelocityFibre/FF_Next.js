import { UseFormReturn } from 'react-hook-form';
import { ProjectPriority } from '../../../types/project.types';
import type { FormData } from '../types';

interface ProjectDetailsStepProps {
  form: UseFormReturn<FormData>;
  projectManagers: Array<{ id: string; name: string }>;
  isProjectManagersLoading: boolean;
}

export function ProjectDetailsStep({ 
  form, 
  projectManagers, 
  isProjectManagersLoading 
}: ProjectDetailsStepProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Location
        </label>
        <input
          {...register('location')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="City, Region"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (R)
          </label>
          <input
            {...register('budget', { 
              min: { value: 0, message: 'Budget must be positive' }
            })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
          {errors.budget && (
            <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            {...register('priority')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ProjectPriority.MEDIUM}>Medium</option>
            <option value={ProjectPriority.LOW}>Low</option>
            <option value={ProjectPriority.HIGH}>High</option>
            <option value={ProjectPriority.CRITICAL}>Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Manager
        </label>
        {isProjectManagersLoading ? (
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            Loading project managers...
          </div>
        ) : (
          <select
            {...register('projectManagerId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select project manager</option>
            {projectManagers?.map(pm => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes or requirements"
        />
      </div>
    </div>
  );
}