/**
 * Contractor Detail Sections - View-only sections for contractor information
 * Following FibreFlow UI/UX patterns and keeping under 250 lines
 */

import { Contractor } from '@/types/contractor.types';
import { Building2, User, MapPin, CreditCard, Award, Users, FileText } from 'lucide-react';

interface SectionProps {
  contractor: Contractor;
}

export function ContractorInfoSection({ contractor }: SectionProps) {
  const ragColors = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    blacklisted: 'bg-red-100 text-red-800',
    under_review: 'bg-blue-100 text-blue-800'
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{contractor.companyName}</h1>
      <div className="flex items-center gap-4 mt-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[contractor.status]}`}>
          {contractor.status.replace('_', ' ').toUpperCase()}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragOverall]}`}>
          RAG: {contractor.ragOverall.toUpperCase()}
        </span>
        <span className="text-sm text-gray-500">
          {contractor.registrationNumber}
        </span>
      </div>
      <p className="text-gray-600 mt-1">{contractor.industryCategory}</p>
    </div>
  );
}

export function ContactDetailsSection({ contractor }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Person</label>
          <p className="text-gray-900">{contractor.contactPerson}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900">{contractor.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <p className="text-gray-900">{contractor.phone || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alternative Phone</label>
          <p className="text-gray-900">{contractor.alternatePhone || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}

export function CompanyDetailsSection({ contractor }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Type</label>
          <p className="text-gray-900">{contractor.businessType?.replace('_', ' ').toUpperCase()}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Industry Category</label>
          <p className="text-gray-900">{contractor.industryCategory}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Years in Business</label>
          <p className="text-gray-900">{contractor.yearsInBusiness || 'Not specified'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee Count</label>
          <p className="text-gray-900">{contractor.employeeCount || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
}

export function AddressDetailsSection({ contractor }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Physical Address</label>
          <p className="text-gray-900">{contractor.physicalAddress || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal Address</label>
          <p className="text-gray-900">{contractor.postalAddress || 'Same as physical address'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <p className="text-gray-900">{contractor.city || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Province</label>
            <p className="text-gray-900">{contractor.province || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
            <p className="text-gray-900">{contractor.postalCode || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FinancialDetailsSection({ contractor }: SectionProps) {
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

export function PerformanceMetricsSection({ contractor }: SectionProps) {
  const ragColors = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Performance & RAG Scores</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{contractor.performanceScore || 'N/A'}</p>
          <p className="text-sm text-gray-600">Performance</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{contractor.safetyScore || 'N/A'}</p>
          <p className="text-sm text-gray-600">Safety</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Financial</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragFinancial]}`}>
            {contractor.ragFinancial.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Compliance</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragCompliance]}`}>
            {contractor.ragCompliance.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Performance</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragPerformance]}`}>
            {contractor.ragPerformance.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Safety</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragSafety]}`}>
            {contractor.ragSafety.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProjectMetricsSection({ contractor }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Statistics</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xl font-bold text-blue-600">{contractor.activeProjects}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xl font-bold text-green-600">{contractor.completedProjects}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-gray-600">{contractor.totalProjects}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-xl font-bold text-red-600">{contractor.cancelledProjects}</p>
          <p className="text-sm text-gray-600">Cancelled</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Onboarding Progress</span>
          <span className="text-sm font-bold text-yellow-600">{contractor.onboardingProgress}%</span>
        </div>
        <div className="w-full bg-yellow-200 rounded-full h-2 mt-1">
          <div 
            className="bg-yellow-600 h-2 rounded-full" 
            style={{ width: `${contractor.onboardingProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export function NotesSection({ contractor }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Notes & Tags</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {contractor.tags && contractor.tags.length > 0 ? (
              contractor.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No tags</span>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <p className="text-gray-900 whitespace-pre-wrap">
            {contractor.notes || 'No notes available'}
          </p>
        </div>
      </div>
    </div>
  );
}