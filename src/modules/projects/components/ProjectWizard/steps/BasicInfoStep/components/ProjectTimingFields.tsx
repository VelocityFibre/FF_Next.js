

interface ProjectTimingFieldsProps {
  register: any;
  errors: any;
}

export function ProjectTimingFields({ register, errors }: ProjectTimingFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          Duration (Months) *
        </label>
        <input
          {...register('durationMonths', { 
            required: 'Duration is required',
            min: { value: 1, message: 'Duration must be at least 1 month' },
            max: { value: 60, message: 'Duration cannot exceed 60 months' },
            valueAsNumber: true
          })}
          type="number"
          min="1"
          max="60"
          step="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 6"
        />
        {errors.durationMonths && (
          <p className="mt-1 text-sm text-red-600">{errors.durationMonths.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calculated End Date
        </label>
        <input
          {...register('endDate')}
          type="date"
          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed"
          readOnly
          title="This is automatically calculated based on start date and duration"
        />
        <p className="mt-1 text-xs text-gray-500">Calculated from start date + duration</p>
      </div>
    </div>
  );
}