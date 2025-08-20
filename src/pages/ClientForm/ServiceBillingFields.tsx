import { ClientFormData, ServiceType, PaymentTerms, Currency } from '@/types/client.types';

interface ServiceBillingFieldsProps {
  formData: ClientFormData;
  onChange: (field: keyof ClientFormData, value: any) => void;
  onToggleService: (service: ServiceType) => void;
}

export function ServiceBillingFields({ formData, onChange, onToggleService }: ServiceBillingFieldsProps) {
  return (
    <>
      {/* Service Information */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Service Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Services Required
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(ServiceType).map((service) => (
                <label key={service} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.serviceTypes?.includes(service)}
                    onChange={() => onToggleService(service)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <span className="ml-2 text-sm text-neutral-700">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Special Requirements
            </label>
            <textarea
              value={formData.specialRequirements}
              onChange={(e) => onChange('specialRequirements', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Any special requirements or notes..."
            />
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Payment Terms
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => onChange('paymentTerms', e.target.value as PaymentTerms)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Payment Terms</option>
              <option value={PaymentTerms.NET_30}>Net 30</option>
              <option value={PaymentTerms.NET_60}>Net 60</option>
              <option value={PaymentTerms.NET_90}>Net 90</option>
              <option value={PaymentTerms.DUE_ON_RECEIPT}>Due on Receipt</option>
              <option value={PaymentTerms.PREPAID}>Prepaid</option>
              <option value={PaymentTerms.CUSTOM}>Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Credit Limit
            </label>
            <input
              type="number"
              value={formData.creditLimit}
              onChange={(e) => onChange('creditLimit', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Preferred Currency
            </label>
            <select
              value={formData.preferredCurrency}
              onChange={(e) => onChange('preferredCurrency', e.target.value as Currency)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Currency</option>
              <option value={Currency.USD}>USD</option>
              <option value={Currency.EUR}>EUR</option>
              <option value={Currency.GBP}>GBP</option>
              <option value={Currency.ZAR}>ZAR</option>
              <option value={Currency.OTHER}>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Contract Value
            </label>
            <input
              type="number"
              value={formData.contractValue}
              onChange={(e) => onChange('contractValue', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Billing Email
            </label>
            <input
              type="email"
              value={formData.billingEmail}
              onChange={(e) => onChange('billingEmail', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="billing@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => onChange('accountNumber', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Additional notes..."
          />
        </div>
      </div>
    </>
  );
}