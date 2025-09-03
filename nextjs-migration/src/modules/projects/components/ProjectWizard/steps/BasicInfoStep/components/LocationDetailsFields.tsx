

interface LocationDetailsFieldsProps {
  register: any;
  errors: any;
  isGeocoding: boolean;
}

export function LocationDetailsFields({ register, errors, isGeocoding }: LocationDetailsFieldsProps) {
  return (
    <div className="pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-600 mb-3">
        Location details (auto-populated from GPS coordinates):
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City/Town</label>
          <input
            {...register('location.city', { required: 'City/Town is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            placeholder="Will be auto-populated"
            readOnly={isGeocoding}
          />
          {errors.location?.city && (
            <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Municipal District</label>
          <input
            {...register('location.region' as any, { required: 'Region is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            placeholder="Will be auto-populated"
            readOnly={isGeocoding}
          />
          {errors.location?.region && (
            <p className="mt-1 text-sm text-red-600">{errors.location.region.message}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
        <input
          {...register('location.province', { required: 'Province is required' })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          placeholder="Will be auto-populated"
          readOnly={isGeocoding}
        />
        {errors.location?.province && (
          <p className="mt-1 text-sm text-red-600">{errors.location.province.message}</p>
        )}
      </div>
    </div>
  );
}