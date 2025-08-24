/**
 * Financial Details Section
 * Displays financial information, banking details and credit rating
 */

import { CreditCard } from 'lucide-react';
import { Contractor } from '@/types/contractor.types';

interface FinancialDetailsProps {
  contractor: Contractor;
}

export function FinancialDetails({ contractor }: FinancialDetailsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Turnover</label>
          <p className="text-gray-900">
            {contractor.annualTurnover 
              ? `R ${contractor.annualTurnover.toLocaleString()}` 
              : 'Not disclosed'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Credit Rating</label>
            <p className="text-gray-900">{contractor.creditRating || 'Unrated'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
            <p className="text-gray-900">{contractor.paymentTerms || 'Not specified'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <p className="text-gray-900">{contractor.bankName || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Number</label>
            <p className="text-gray-900">{contractor.accountNumber || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch Code</label>
            <p className="text-gray-900">{contractor.branchCode || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}