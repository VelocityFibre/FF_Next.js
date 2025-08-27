/**
 * ContractorCreate Component - Create new contractor following FibreFlow patterns
 * Integrated with Neon database and Firebase for full functionality
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { contractorService } from '@/services/contractorService';
import { ContractorFormData, ContractorStatus } from '@/types/contractor.types';
import {
  BasicInfoSection,
  ContactInfoSection,
  AddressSection,
  FinancialSection,
  StatusSection
} from './ContractorFormSections';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { log } from '@/lib/logger';

export function ContractorCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ContractorFormData>({
    companyName: '',
    registrationNumber: '',
    businessType: 'pty_ltd',
    industryCategory: 'Telecommunications',
    
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    
    physicalAddress: '',
    postalAddress: '',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '',
    
    creditRating: 'unrated',
    paymentTerms: 'net_30',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    
    status: 'pending' as ContractorStatus,
    complianceStatus: 'pending',
    
    notes: '',
    tags: [],
  });

  const handleInputChange = (field: keyof ContractorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const validateForm = (): string | null => {
    if (!formData.companyName.trim()) {
      return 'Company name is required';
    }
    
    if (!formData.registrationNumber.trim()) {
      return 'Registration number is required';
    }
    
    if (!formData.contactPerson.trim()) {
      return 'Contact person is required';
    }
    
    if (!formData.email.trim()) {
      return 'Email address is required';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await contractorService.create(formData);
      toast.success('Contractor created successfully!');
      navigate('/app/contractors');
    } catch (error) {
      log.error('Failed to create contractor:', { data: error }, 'ContractorCreate');
      toast.error('Failed to create contractor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/contractors')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Contractors
        </button>
        
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Contractor</h1>
            <p className="text-gray-600">Create a new contractor profile with company and contact details</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <BasicInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <ContactInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <AddressSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <FinancialSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <StatusSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />

          {/* Additional Information */}
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/app/contractors')}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Contractor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}