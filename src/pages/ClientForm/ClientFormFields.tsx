import { ClientFormData, ClientType, ServiceType, PaymentTerms, Currency } from '@/types/client.types';

interface ClientFormFieldsProps {
  formData: ClientFormData;
  onChange: (field: keyof ClientFormData, value: any) => void;
}

export function ClientFormFields({ formData, onChange }: ClientFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Company Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => onChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Client Code
            </label>
            <input
              type="text"
              value={formData.clientCode}
              onChange={(e) => onChange('clientCode', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Auto-generated if empty"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Client Type <span className="text-error-500">*</span>
            </label>
            <select
              value={formData.clientType}
              onChange={(e) => onChange('clientType', e.target.value as ClientType)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Type</option>
              <option value={ClientType.ENTERPRISE}>Enterprise</option>
              <option value={ClientType.SMB}>SMB</option>
              <option value={ClientType.GOVERNMENT}>Government</option>
              <option value={ClientType.NON_PROFIT}>Non-Profit</option>
              <option value={ClientType.RESIDENTIAL}>Residential</option>
              <option value={ClientType.OTHER}>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Industry
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => onChange('industry', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => onChange('registrationNumber', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tax Number
            </label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => onChange('taxNumber', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => onChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags?.join(', ')}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                onChange('tags', tags);
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter tags separated by commas"
            />
          </div>
        </div>
      </div>
    </div>
  );
}