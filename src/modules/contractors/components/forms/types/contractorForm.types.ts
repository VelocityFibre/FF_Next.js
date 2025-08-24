import { ContractorFormData } from '@/types/contractor.types';

export interface FormSectionProps {
  formData: ContractorFormData;
  handleInputChange: (field: keyof ContractorFormData, value: any) => void;
}