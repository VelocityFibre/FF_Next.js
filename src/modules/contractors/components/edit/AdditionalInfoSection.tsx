/**
 * Additional Info Section Component
 * Additional information fields for contractor edit form
 */

import { ContractorFormData } from '@/types/contractor.types';

interface AdditionalInfoSectionProps {
  formData: ContractorFormData;
  handleInputChange: (field: keyof ContractorFormData, value: any) => void;
  handleTagsChange: (value: string) => void;
}

export function AdditionalInfoSection({
  formData,
  handleInputChange,
  handleTagsChange
}: AdditionalInfoSectionProps) {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags.join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="e.g., preferred, specialist, long-term"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            placeholder="Additional notes about the contractor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}