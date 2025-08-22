import { UseFormReturn } from 'react-hook-form';
import type { FormData } from '../types';

interface BasicInfoStepProps {
  form: UseFormReturn<FormData>;
  clients: Array<{ id: string; name: string }>;
  isClientsLoading: boolean;
}

export function BasicInfoStep({ form, clients, isClientsLoading }: BasicInfoStepProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Name *
        </label>
        <input
          {...register('name', { required: 'Project name is required' })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter project name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of the project"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client *
        </label>
        {isClientsLoading ? (
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            Loading clients...
          </div>
        ) : (
          <select
            {...register('clientId', { required: 'Client is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a client</option>
            {clients?.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        )}
        {errors.clientId && (
          <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            {...register('startDate', { required: 'Start date is required' })}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected End Date
          </label>
          <input
            {...register('endDate')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}