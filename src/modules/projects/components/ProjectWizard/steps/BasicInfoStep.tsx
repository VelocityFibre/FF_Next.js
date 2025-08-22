import { UseFormReturn } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { reverseGeocode, getCurrentLocation, validateSouthAfricanGPS, parseGPSCoordinates } from '@/utils/geoLocation';
import type { FormData } from '../types';

interface BasicInfoStepProps {
  form: UseFormReturn<FormData>;
  clients: Array<{ id: string; name: string }>;
  isClientsLoading: boolean;
}

export function BasicInfoStep({ form, clients, isClientsLoading }: BasicInfoStepProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [gpsInput, setGpsInput] = useState('');
  
  // Watch for changes in start date and duration
  const startDate = watch('startDate');
  const durationMonths = watch('durationMonths');
  
  // Watch for GPS coordinate changes
  const gpsLatitude = watch('location.gpsLatitude');
  const gpsLongitude = watch('location.gpsLongitude');
  
  // Calculate end date when start date or duration changes
  useEffect(() => {
    if (startDate && durationMonths && durationMonths > 0) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(start.getMonth() + durationMonths);
      
      // Format to YYYY-MM-DD for the date input
      const formattedEndDate = end.toISOString().split('T')[0];
      setValue('endDate', formattedEndDate);
    }
  }, [startDate, durationMonths, setValue]);

  // Auto-populate location when GPS coordinates change
  useEffect(() => {
    async function populateLocation() {
      if (!gpsLatitude || !gpsLongitude) return;
      
      const lat = parseFloat(gpsLatitude);
      const lng = parseFloat(gpsLongitude);
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Validate coordinates are in South Africa
      if (!validateSouthAfricanGPS(lat, lng)) {
        setGeocodingError('Coordinates must be within South Africa');
        return;
      }

      setIsGeocoding(true);
      setGeocodingError(null);

      try {
        const locationData = await reverseGeocode(lat, lng);
        
        if (locationData) {
          setValue('location.city', locationData.city);
          setValue('location.municipalDistrict', locationData.municipalDistrict);
          setValue('location.province', locationData.province);
        } else {
          setGeocodingError('Could not find location information');
        }
      } catch (error) {
        setGeocodingError('Failed to lookup location');
        console.error('Geocoding error:', error);
      } finally {
        setIsGeocoding(false);
      }
    }

    populateLocation();
  }, [gpsLatitude, gpsLongitude, setValue]);

  // Get current location
  const handleGetCurrentLocation = async () => {
    setIsGeocoding(true);
    setGeocodingError(null);

    try {
      const position = await getCurrentLocation();
      setValue('location.gpsLatitude', position.lat.toString());
      setValue('location.gpsLongitude', position.lng.toString());
    } catch (error) {
      setGeocodingError('Could not get current location');
      console.error('Geolocation error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Parse GPS input from various formats
  const handleGpsInputParse = () => {
    if (!gpsInput.trim()) return;

    const coords = parseGPSCoordinates(gpsInput.trim());
    if (coords) {
      setValue('location.gpsLatitude', coords.lat.toString());
      setValue('location.gpsLongitude', coords.lng.toString());
      setGpsInput(''); // Clear input after successful parse
      setGeocodingError(null);
    } else {
      setGeocodingError('Could not parse GPS coordinates. Try formats like: "-34.031085, 18.463559" or "33.9221° S, 18.4231° E"');
    }
  };

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Location *
        </label>
        <div className="space-y-4">
          {/* GPS Coordinates - First Step */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                GPS Coordinates *
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGeocoding}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
              >
                {isGeocoding ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3 mr-1" />
                )}
                Use Current Location
              </button>
            </div>

            {/* GPS Input - Any Format */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste GPS Coordinates (Any Format)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gpsInput}
                  onChange={(e) => setGpsInput(e.target.value)}
                  placeholder="e.g., -34.031085, 18.463559 or 33.9221° S, 18.4231° E"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleGpsInputParse}
                  disabled={!gpsInput.trim() || isGeocoding}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Parse
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Supports: decimal (-34.031, 18.463), DMS (33°55'19" S, 18°25'23" E), and more
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('location.gpsLatitude', { 
                    required: 'Latitude is required',
                    pattern: {
                      value: /^-?([1-8]?[0-9]\.{1}\d{1,6}$|90\.{1}0{1,6}$)/,
                      message: 'Enter valid latitude (-35 to -22 for SA)'
                    }
                  })}
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Latitude (e.g., -26.195246)"
                />
                {errors.location?.gpsLatitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.gpsLatitude.message}</p>
                )}
              </div>
              
              <div>
                <input
                  {...register('location.gpsLongitude', { 
                    required: 'Longitude is required',
                    pattern: {
                      value: /^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/,
                      message: 'Enter valid longitude (16 to 33 for SA)'
                    }
                  })}
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Longitude (e.g., 28.034088)"
                />
                {errors.location?.gpsLongitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.gpsLongitude.message}</p>
                )}
              </div>
            </div>
            
            {geocodingError && (
              <p className="mt-1 text-sm text-red-600">{geocodingError}</p>
            )}
            
            {isGeocoding && (
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Looking up location information...
              </div>
            )}
          </div>

          {/* Auto-populated Location Fields */}
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
                  {...register('location.municipalDistrict', { required: 'Municipal district is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Will be auto-populated"
                  readOnly={isGeocoding}
                />
                {errors.location?.municipalDistrict && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.municipalDistrict.message}</p>
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
        </div>
      </div>

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
    </div>
  );
}