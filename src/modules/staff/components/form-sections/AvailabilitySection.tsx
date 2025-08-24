import { StaffFormData } from '@/types/staff.types';

interface AvailabilitySectionProps {
  formData: StaffFormData;
  handleInputChange: (field: keyof StaffFormData, value: any) => void;
}

export function AvailabilitySection({ formData, handleInputChange }: AvailabilitySectionProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Availability & Scheduling</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Working Hours
          </label>
          <input
            type="text"
            value={formData.workingHours}
            onChange={(e) => handleInputChange('workingHours', e.target.value)}
            placeholder="e.g., 8:00 AM - 5:00 PM"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Zone
          </label>
          <select
            value={formData.timeZone}
            onChange={(e) => handleInputChange('timeZone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CAT">CAT (Central Africa Time)</option>
            <option value="SAST">SAST (South African Standard Time)</option>
            <option value="EAT">EAT (East Africa Time)</option>
            <option value="WAT">WAT (West Africa Time)</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.availableWeekends}
              onChange={(e) => handleInputChange('availableWeekends', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Available Weekends</span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.availableNights}
              onChange={(e) => handleInputChange('availableNights', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Available Nights</span>
          </label>
        </div>
      </div>
    </div>
  );
}