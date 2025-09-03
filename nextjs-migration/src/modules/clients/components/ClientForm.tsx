import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building } from 'lucide-react';
import { useClient, useCreateClient, useUpdateClient } from '@/hooks/useClients';
import { 
  ClientFormData, 
  ClientStatus, 
  ClientCategory,
  ClientPriority,
  PaymentTerms,
  CreditRating,
  ContactMethod,
  ServiceType
} from '@/types/client.types';
import {
  BasicInfoSection,
  CompanyDetailsSection,
  AddressSection,
  FinancialSection,
  CommunicationSection
} from './ClientFormSections';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { log } from '@/lib/logger';

export function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: client, isLoading } = useClient(id || '');
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    alternativeEmail: '',
    alternativePhone: '',
    registrationNumber: '',
    vatNumber: '',
    address: {
      street: '',
      city: 'Johannesburg',
      state: 'Gauteng',
      postalCode: '',
      country: 'South Africa'
    },
    industry: '',
    website: '',
    status: ClientStatus.PROSPECT,
    category: ClientCategory.SME,
    priority: ClientPriority.MEDIUM,
    creditLimit: 100000,
    paymentTerms: PaymentTerms.NET_30,
    creditRating: CreditRating.UNRATED,
    preferredContactMethod: ContactMethod.EMAIL,
    communicationLanguage: 'English',
    timezone: 'Africa/Johannesburg',
    serviceTypes: [],
    tags: [],
    notes: '',
    specialRequirements: ''
  });

  useEffect(() => {
    if (client && isEditing) {
      setFormData({
        name: client.name,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        alternativeEmail: client.alternativeEmail || '',
        alternativePhone: client.alternativePhone || '',
        registrationNumber: client.registrationNumber || '',
        vatNumber: client.vatNumber || '',
        address: {
          street: client.address,
          city: client.city,
          state: client.province,
          postalCode: client.postalCode,
          country: client.country
        },
        industry: client.industry,
        website: client.website || '',
        status: client.status,
        category: client.category,
        priority: client.priority,
        creditLimit: client.creditLimit,
        paymentTerms: client.paymentTerms,
        creditRating: client.creditRating,
        preferredContactMethod: client.preferredContactMethod,
        communicationLanguage: client.communicationLanguage,
        timezone: client.timezone,
        serviceTypes: client.serviceTypes || [],
        tags: client.tags || [],
        notes: client.notes || '',
        specialRequirements: client.specialRequirements || ''
      });
    }
  }, [client, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: id!, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/app/clients');
    } catch (error) {
      log.error('Failed to save client:', { data: error }, 'ClientForm');
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleServiceType = (service: ServiceType) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading client..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/clients')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Client List
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Client' : 'Add New Client'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <BasicInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <CompanyDetailsSection 
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
          
          <CommunicationSection 
            formData={formData} 
            handleInputChange={handleInputChange}
          />

          {/* Service Types */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Service Types</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(ServiceType).map(service => (
                <label key={service} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.serviceTypes.includes(service)}
                    onChange={() => toggleServiceType(service)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {service.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div>
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
                  placeholder="e.g., premium, long-term, high-volume"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  rows={3}
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/app/clients')}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Client' : 'Create Client'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}