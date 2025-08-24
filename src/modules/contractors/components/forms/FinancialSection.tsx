import { FormSectionProps } from './types/contractorForm.types';

export function FinancialSection({ formData, handleInputChange }: FormSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Turnover (ZAR)
          </label>
          <input
            type="number"
            value={formData.annualTurnover || ''}
            onChange={(e) => handleInputChange('annualTurnover', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Rating
          </label>
          <select
            value={formData.creditRating}
            onChange={(e) => handleInputChange('creditRating', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="unrated">Unrated</option>
            <option value="AAA">AAA</option>
            <option value="AA">AA</option>
            <option value="A">A</option>
            <option value="BBB">BBB</option>
            <option value="BB">BB</option>
            <option value="B">B</option>
            <option value="CCC">CCC</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Terms
          </label>
          <select
            value={formData.paymentTerms}
            onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cod">Cash on Delivery</option>
            <option value="net_7">Net 7 Days</option>
            <option value="net_30">Net 30 Days</option>
            <option value="net_45">Net 45 Days</option>
            <option value="net_60">Net 60 Days</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input
            type="text"
            value={formData.bankName || ''}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bank name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <input
            type="text"
            value={formData.accountNumber || ''}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Account number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Code
          </label>
          <input
            type="text"
            value={formData.branchCode || ''}
            onChange={(e) => handleInputChange('branchCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Branch code"
          />
        </div>
      </div>
    </div>
  );
}