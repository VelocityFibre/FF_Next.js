/**
 * Contractor Edit Form Component
 * Main form component for editing contractors
 */

import React from 'react';
import {
  BasicInfoSection,
  ContactInfoSection,
  AddressSection,
  FinancialSection,
  StatusSection
} from '../ContractorFormSections';
import { AdditionalInfoSection } from './AdditionalInfoSection';
import { ContractorEditActions } from './ContractorEditActions';
import { ContractorFormData } from '@/types/contractor.types';
import { validateContractorForm } from './formValidation';
import toast from 'react-hot-toast';

interface ContractorEditFormProps {
  formData: ContractorFormData;
  isSubmitting: boolean;
  handleInputChange: (field: keyof ContractorFormData, value: any) => void;
  handleTagsChange: (value: string) => void;
  handleSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function ContractorEditForm({
  formData,
  isSubmitting,
  handleInputChange,
  handleTagsChange,
  handleSubmit,
  onCancel
}: ContractorEditFormProps) {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateContractorForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    await handleSubmit();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={onSubmit} className="p-6 space-y-8">
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

        <AdditionalInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          handleTagsChange={handleTagsChange}
        />

        <ContractorEditActions
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </form>
    </div>
  );
}