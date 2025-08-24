
import type { SectionProps } from '../types/clientSection.types';
import { formatCurrency, getCreditRatingColor, formatTextUppercase } from '../utils/displayUtils';

export function FinancialDetailsSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Credit Limit</p>
          <p className="font-medium text-lg">{formatCurrency(client.creditLimit)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="font-medium text-lg">{formatCurrency(client.currentBalance)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Payment Terms</p>
          <p className="font-medium">{formatTextUppercase(client.paymentTerms)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Credit Rating</p>
          <p className={`font-medium ${getCreditRatingColor(client.creditRating)}`}>
            {client.creditRating.charAt(0).toUpperCase() + client.creditRating.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}