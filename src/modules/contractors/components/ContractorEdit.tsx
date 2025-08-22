/**
 * ContractorEdit Component - Edit existing contractor following FibreFlow patterns
 * Integrated with Neon database and Firebase for full functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { contractorService } from '@/services/contractorService';
import { ContractorFormData, Contractor } from '@/types/contractor.types';
import {
  BasicInfoSection,
  ContactInfoSection,
  AddressSection,
  FinancialSection,
  StatusSection
} from './ContractorFormSections';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export function ContractorEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ContractorFormData>({
    companyName: '',
    registrationNumber: '',
    businessType: 'pty_ltd',
    industryCategory: '',
    yearsInBusiness: undefined,
    employeeCount: undefined,
    
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    
    physicalAddress: '',
    postalAddress: '',
    city: '',
    province: '',
    postalCode: '',
    
    annualTurnover: undefined,
    creditRating: '',
    paymentTerms: '',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    
    status: 'pending',
    complianceStatus: 'pending',
    
    notes: '',
    tags: [],
  });

  useEffect(() => {
    const loadContractor = async () => {
      if (!id) {
        navigate('/app/contractors');
        return;
      }

      try {
        const contractorData = await contractorService.getById(id);
        if (!contractorData) {
          toast.error('Contractor not found');
          navigate('/app/contractors');
          return;
        }

        setContractor(contractorData);
        setFormData({
          companyName: contractorData.companyName,
          registrationNumber: contractorData.registrationNumber,
          businessType: contractorData.businessType,
          industryCategory: contractorData.industryCategory,
          yearsInBusiness: contractorData.yearsInBusiness,
          employeeCount: contractorData.employeeCount,
          
          contactPerson: contractorData.contactPerson,
          email: contractorData.email,
          phone: contractorData.phone || '',
          alternatePhone: contractorData.alternatePhone || '',
          
          physicalAddress: contractorData.physicalAddress || '',
          postalAddress: contractorData.postalAddress || '',
          city: contractorData.city || '',
          province: contractorData.province || '',
          postalCode: contractorData.postalCode || '',
          
          annualTurnover: contractorData.annualTurnover,
          creditRating: contractorData.creditRating || '',
          paymentTerms: contractorData.paymentTerms || '',
          bankName: contractorData.bankName || '',
          accountNumber: contractorData.accountNumber || '',
          branchCode: contractorData.branchCode || '',
          
          status: contractorData.status,
          complianceStatus: contractorData.complianceStatus,
          
          notes: contractorData.notes || '',
          tags: contractorData.tags || [],
        });
      } catch (error) {
        console.error('Failed to load contractor:', error);
        toast.error('Failed to load contractor data');
        navigate('/app/contractors');
      } finally {
        setIsLoading(false);
      }
    };

    loadContractor();
  }, [id, navigate]);

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
    
    if (!id) return;
    
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await contractorService.update(id, formData);
      toast.success('Contractor updated successfully!');
      navigate('/app/contractors');
    } catch (error) {
      console.error('Failed to update contractor:', error);
      toast.error('Failed to update contractor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading contractor..." />
      </div>
    );
  }

  if (!contractor) {
    return null;
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Contractor</h1>
            <p className="text-gray-600">Update contractor information and settings</p>
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Contractor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}